"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ProductPhoto, ProductVariant } from "@/lib/catalog-types";
import { FavoriteButton } from "@/components/favorites";
import StoreHeader from "@/components/store-header";
import StoreFooter from "@/components/store-footer";
import styles from "@/components/store-shell.module.css";

const currency = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const audiences: Record<string, string> = { mujer: "Mujer", hombre: "Hombre", unisex: "Unisex" };
// Configuración opcional para más adelante. No hace falta completarla ahora.
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").trim();
const whatsappReady = /^[1-9]\d{7,14}$/.test(whatsappNumber);

export default function ProductDetail({
  name, description, price, audience, photos, variants, preview = false, productId,
}: {
  name: string;
  description: string;
  price: number;
  audience: string;
  photos: ProductPhoto[];
  variants: ProductVariant[];
  preview?: boolean;
  productId?: string;
}) {
  const searchParams = useSearchParams();
  const returnQuery = searchParams.toString();
  const fromFavorites = searchParams.get("from") === "favorites";
  const fromHome = searchParams.get("from") === "home";
  const homeUrl = searchParams.get("section") === "destacados" ? "/#destacados" : "/#novedades";
  const catalogUrl = fromFavorites ? "/favoritos" : fromHome ? homeUrl : "/catalogo" + (returnQuery ? "?" + returnQuery : "");
  const [photoId, setPhotoId] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const photo = photos.find((item) => item.id === photoId) ?? photos[0];
  const colors = [...new Set(variants.map((item) => item.color))].sort((a, b) => a.localeCompare(b, "es"));
  const colorVariants = variants.filter((item) => item.color === color);
  const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const sortedSizes = [...colorVariants].sort((a, b) => {
    const ia = sizeOrder.indexOf(a.size);
    const ib = sizeOrder.indexOf(b.size);
    if (ia >= 0 && ib >= 0) return ia - ib;
    return a.size.localeCompare(b.size, "es", { numeric: true });
  });
  const selected = colorVariants.find((item) => item.size === size && item.is_available);
  const hasAvailable = variants.some((item) => item.is_available);
  const message = selected
    ? "Hola, me interesa " + name + " de LUCYNE. Color: " + selected.color + ". Talla: " + selected.size + ". Precio: " + currency.format(price) + ". ¿Me confirman la disponibilidad?"
    : "";
  const whatsappUrl = !preview && selected && whatsappReady
    ? "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message)
    : null;

  return (
    <>
    {!preview && <StoreHeader active="catalog" />}
    <main id="lucyne-main" tabIndex={-1} className={styles.main + " bg-[#F2F2F2] px-5 pb-16 pt-5 text-black sm:px-8 sm:pb-24 sm:pt-6"}>
      <div className="mx-auto max-w-7xl">
        {preview ? (
        <nav aria-label="Navegación de la vista previa" className="mb-8 flex flex-wrap items-center justify-between gap-5 border-b border-black/10 pb-6">
          <Link href="/admin" aria-label="LUCYNE, administración">
            <Image src="/images/logo-lucyne.png" width={170} height={60} alt="LUCYNE" className="h-auto w-32 sm:w-40" />
          </Link>
          <Link href="/admin" className="text-sm font-semibold text-black/60 hover:text-black">← Volver al administrador</Link>
        </nav>
        ) : (
          <Link href={catalogUrl} className={styles.back}>{fromFavorites ? "← Volver a favoritos" : fromHome ? "← Volver al inicio" : "← Volver al catálogo"}</Link>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <section aria-label="Fotografías del producto">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-black/10 bg-white">
              {photo ? (
                <Image src={photo.url} alt={photo.alt} fill unoptimized sizes="(max-width: 1024px) 95vw, 55vw" className="object-contain p-5" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-black/50">Fotografía próximamente</div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {photos.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={"Ver fotografía " + (index + 1)}
                    aria-pressed={photo?.id === item.id}
                    onClick={() => setPhotoId(item.id)}
                    className={"relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white " + (photo?.id === item.id ? "border-[#B91C5B]" : "border-transparent hover:border-black/20")}
                  >
                    <Image src={item.url} alt="" fill unoptimized sizes="80px" className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className={"py-2 lg:sticky " + (preview ? "lg:top-8" : "lg:top-32")}>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B91C5B]">{audiences[audience] ?? audience}</p>
            <h1 className="mt-3 break-words text-3xl font-black tracking-tight sm:text-4xl">{name}</h1>
            <p className="mt-5 text-3xl font-black">{currency.format(price)}</p>
            {!preview && productId && <div className="mt-4"><FavoriteButton productId={productId} name={name} /></div>}
            {description && <p className="mt-6 whitespace-pre-line break-words leading-relaxed text-black/65">{description}</p>}

            {variants.length === 0 ? (
              <p className="mt-8 rounded-2xl bg-white p-5 text-sm text-black/60">Pronto estarán disponibles las tallas y colores de esta prenda.</p>
            ) : (
              <div className="mt-8 space-y-7 border-t border-black/10 pt-7">
                <fieldset>
                  <legend className="mb-3 text-sm font-bold">Color{color ? ": " + color : ""}</legend>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((item) => {
                      const matches = variants.filter((variant) => variant.color === item);
                      const available = matches.some((variant) => variant.is_available);
                      const hex = matches.find((variant) => variant.color_hex)?.color_hex;
                      return (
                        <button
                          key={item}
                          type="button"
                          disabled={!available}
                          aria-pressed={color === item}
                          onClick={() => { setColor(item); setSize(""); }}
                          className={"inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45 " + (color === item ? "border-black bg-white ring-1 ring-black" : "border-black/15 bg-white/70")}
                        >
                          {hex && <span aria-hidden="true" className="h-4 w-4 rounded-full border border-black/20" style={{ backgroundColor: hex }} />}
                          {item}{!available ? " · Agotado" : ""}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-3 text-sm font-bold">Talla</legend>
                  {!color ? <p className="text-sm text-black/60">Selecciona primero un color.</p> : (
                    <div className="flex flex-wrap gap-2">
                      {sortedSizes.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          disabled={!item.is_available}
                          aria-label={"Talla " + item.size + (item.is_available ? "" : ", agotada")}
                          aria-pressed={size === item.size}
                          onClick={() => setSize(item.size)}
                          className={"min-w-12 rounded-xl border px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-35 disabled:line-through " + (size === item.size ? "border-black bg-black text-white" : "border-black/15 bg-white")}
                        >
                          {item.size}
                        </button>
                      ))}
                    </div>
                  )}
                </fieldset>
                <p role="status" className={"text-sm font-semibold " + (selected ? "text-emerald-800" : "text-black/60")}>
                  {!hasAvailable ? "Esta prenda está agotada por el momento." : selected ? selected.color + " · " + selected.size + " · Disponible" : "Elige tu color y talla."}
                </p>
              </div>
            )}

            <div className="mt-8">
              {whatsappUrl ? (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center rounded-full bg-black px-6 py-4 text-center text-sm font-bold text-white transition hover:bg-[#B91C5B]">
                  Consultar por WhatsApp
                </a>
              ) : (
                <button disabled className="w-full rounded-full bg-black/10 px-6 py-4 text-sm font-semibold text-black/50">
                  {preview ? "Vista previa · consultas desactivadas" : !whatsappReady ? "Consultas por WhatsApp próximamente" : !hasAvailable ? "No disponible por el momento" : "Selecciona color y talla"}
                </button>
              )}
            </div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-black/40">Tu estilo. A tu manera.</p>
          </section>
        </div>
      </div>
    </main>
    {!preview && <StoreFooter />}
    </>
  );
}

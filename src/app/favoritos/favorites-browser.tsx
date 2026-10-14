"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorites";
import { removeFavorites, useFavorites } from "@/lib/favorites-store";
import { loadFavoriteProducts, type FavoriteProduct } from "@/lib/favorite-products";

const currency = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const audienceLabels: Record<string, string> = { mujer: "Mujer", hombre: "Hombre", unisex: "Unisex" };
const buttonClass = "rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold hover:border-[#B91C5B] hover:text-[#B91C5B] disabled:cursor-not-allowed disabled:opacity-40";
const PAGE_SIZE = 12;

export default function FavoritesBrowser() {
  const { ids, ready, storageAvailable } = useFavorites();
  const [retry, setRetry] = useState(0);
  const [load, setLoad] = useState<{ key: string; products: FavoriteProduct[]; error: string }>({ key: "", products: [], error: "" });
  const [editError, setEditError] = useState("");
  const [pagination, setPagination] = useState({ key: "", page: 1 });
  const idsKey = ids.join(",");
  const requestKey = idsKey + ":" + retry;

  useEffect(() => {
    if (!ready || !storageAvailable || !idsKey) return;
    const controller = new AbortController();
    loadFavoriteProducts(idsKey.split(","), controller.signal)
      .then((products) => {
        if (!controller.signal.aborted) setLoad({ key: requestKey, products, error: "" });
      })
      .catch(() => {
        // Un fallo de conexión nunca borra los favoritos guardados.
        if (!controller.signal.aborted) setLoad({ key: requestKey, products: [], error: "No pudimos cargar tus prendas. Tus favoritos siguen guardados." });
      });
    return () => controller.abort();
  }, [idsKey, ready, storageAvailable, requestKey]);

  if (!ready) return <p role="status" className="rounded-3xl bg-white p-8 text-black/60">Cargando favoritos…</p>;
  if (!storageAvailable) return (
    <div role="alert" className="rounded-3xl border border-black/10 bg-white p-8">
      <h2 className="text-xl font-bold">El navegador no permite guardar favoritos.</h2>
      <p className="mt-3 text-sm text-black/60">Revisa sus permisos de almacenamiento y recarga esta página.</p>
      <Link href="/catalogo" className="mt-5 inline-block text-sm font-semibold text-[#B91C5B]">Explorar el catálogo →</Link>
    </div>
  );
  if (!ids.length) return (
    <div className="rounded-3xl border border-black/10 bg-white px-6 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B91C5B]">Hecho a tu gusto</p>
      <h2 className="mt-4 text-2xl font-bold">Todavía no has guardado prendas.</h2>
      <p className="mt-3 text-sm text-black/60">Pulsa Guardar en el catálogo para empezar tu selección.</p>
      <Link href="/catalogo" className="mt-7 inline-block rounded-full bg-black px-6 py-3 text-sm font-bold text-white hover:bg-[#B91C5B]">Explorar prendas</Link>
    </div>
  );
  if (load.key !== requestKey) return <p role="status" className="rounded-3xl bg-white p-8 text-black/60">Buscando tus {ids.length} prendas guardadas…</p>;
  if (load.error) return (
    <div className="rounded-3xl border border-black/10 bg-white p-8">
      <p role="alert" className="text-sm text-black/70">{load.error}</p>
      <button type="button" onClick={() => setRetry((value) => value + 1)} className={"mt-5 " + buttonClass}>Reintentar</button>
    </div>
  );

  const products = load.products;
  const existing = new Set(products.map((product) => product.id));
  const missing = ids.filter((id) => !existing.has(id));
  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const page = Math.min(pagination.key === idsKey ? pagination.page : 1, pages);
  const visible = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p role="status" className="text-sm text-black/60">{ids.length} guardadas · {products.length} en el catálogo</p>
        <button type="button" onClick={() => setRetry((value) => value + 1)} className={buttonClass}>Actualizar prendas</button>
      </div>
      {missing.length > 0 && (
        <div className="mb-6 rounded-2xl border border-black/10 bg-white p-5">
          <p className="text-sm font-semibold">{missing.length === 1 ? "Una prenda ya no aparece en el catálogo." : missing.length + " prendas ya no aparecen en el catálogo."}</p>
          <p className="mt-2 text-xs leading-relaxed text-black/60">Puedes conservarlas por si regresan o quitarlas de tus favoritos.</p>
          <button type="button" onClick={() => setEditError(removeFavorites(missing) ?? "")} className="mt-3 text-xs font-bold text-[#B91C5B] hover:underline">Quitar las que no están en el catálogo</button>
          {editError && <p role="alert" className="mt-2 text-xs text-red-700">{editError}</p>}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((product) => (
          <article key={product.id} className="flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white">
            <Link href={"/catalogo/" + product.id + "?from=favorites"} className="group block flex-1">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#FAFAFA]">
                {product.image_url
                  ? <Image src={product.image_url} alt={product.image_alt} fill unoptimized sizes="(max-width: 640px) 95vw, (max-width: 1024px) 45vw, 300px" className="object-contain p-3 transition-transform motion-safe:group-hover:scale-[1.03]" />
                  : <div className="flex h-full items-center justify-center text-sm text-black/50">Fotografía próximamente</div>}
                {product.has_variants && !product.has_available && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-black/65">Agotado</span>}
              </div>
              <div className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B91C5B]">{audienceLabels[product.audience] ?? product.audience}</p>
                <h2 className="mt-2 break-words text-lg font-bold">{product.name}</h2>
                <p className="mt-4 text-xl font-black">{currency.format(product.price)}</p>
                <p className="mt-4 text-sm font-semibold text-[#B91C5B]">Ver tallas y colores →</p>
              </div>
            </Link>
            <div className="border-t border-black/5 px-5 py-4"><FavoriteButton productId={product.id} name={product.name} /></div>
          </article>
        ))}
      </div>
      {pages > 1 && (
        <nav aria-label="Páginas de favoritos" className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button type="button" disabled={page === 1} onClick={() => setPagination({ key: idsKey, page: page - 1 })} className={buttonClass}>Anterior</button>
          <span className="text-sm">{page} / {pages}</span>
          <button type="button" disabled={page === pages} onClick={() => setPagination({ key: idsKey, page: page + 1 })} className={buttonClass}>Siguiente</button>
        </nav>
      )}
      <p className="mt-8 text-xs leading-relaxed text-black/50">Guardar una prenda no la reserva. Los precios y la disponibilidad se consultan al cargar o actualizar esta lista.</p>
    </>
  );
}

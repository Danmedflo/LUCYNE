import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import { FavoriteButton } from "@/components/favorites";
import HomeProductsRetry from "./home-products-retry";
import styles from "./home-products.module.css";

type SelectionKind = "recent" | "featured";
const currency = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const audiences: Record<string, string> = { mujer: "Mujer", hombre: "Hombre", unisex: "Unisex" };
const selections = {
  recent: { id: "novedades", label: "Para descubrir", title: "Novedades", description: "Las últimas prendas incorporadas a nuestra colección.", href: "/catalogo", link: "Ver todas las novedades" },
  featured: { id: "destacados", label: "La selección LUCYNE", title: "Elegidos para ti", description: "Una selección de prendas para hacerlas tuyas.", href: "/catalogo?featured=1", link: "Ver todos los destacados" },
};

function SelectionFrame({ kind, children }: { kind: SelectionKind; children: ReactNode }) {
  const selection = selections[kind];
  return (
    <section id={selection.id} aria-labelledby={selection.id + "-title"} className={styles.section + (kind === "featured" ? " " + styles.featured : "")}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>{selection.label}</p>
            <h2 id={selection.id + "-title"} className={styles.title}>{selection.title}<span>.</span></h2>
            <p className={styles.description}>{selection.description}</p>
          </div>
          <Link href={selection.href} className={styles.explore}>{selection.link}<span aria-hidden="true">↗</span></Link>
        </div>
        {children}
      </div>
    </section>
  );
}

export function HomeProductsSkeleton({ kind }: { kind: SelectionKind }) {
  return (
    <SelectionFrame kind={kind}>
      <p role="status" className="sr-only">Cargando {kind === "recent" ? "novedades" : "destacados"}…</p>
      <div aria-hidden="true" className={styles.grid}>
        {[0, 1, 2, 3].map((index) => <div key={index} className={styles.skeleton + " motion-safe:animate-pulse"}><div className={styles.photo} /><div className={styles.skeletonText} /></div>)}
      </div>
    </SelectionFrame>
  );
}

async function readSelection(kind: SelectionKind) {
  const supabase = createPublicClient();
  let query = supabase.from("products")
    .select("id, name, price, audience, featured, created_at, product_images(id, storage_path, alt_text, sort_order, created_at), product_variants(is_available)")
    .eq("status", "published");
  if (kind === "featured") query = query.eq("featured", true);
  const { data, error } = await query
    .order("created_at", { ascending: false }).order("id", { ascending: true })
    .order("sort_order", { referencedTable: "product_images", ascending: true })
    .order("created_at", { referencedTable: "product_images", ascending: true })
    .order("id", { referencedTable: "product_images", ascending: true })
    .limit(1, { referencedTable: "product_images" }).limit(4);
  if (error) throw new Error("No se pudo cargar la selección.");
  return (data ?? []).map((product) => {
    const photo = product.product_images[0];
    return {
      id: product.id, name: product.name, price: Number(product.price), audience: product.audience, featured: product.featured,
      image: photo ? supabase.storage.from("product-images").getPublicUrl(photo.storage_path).data.publicUrl : null,
      alt: photo?.alt_text || product.name,
      soldOut: product.product_variants.length > 0 && !product.product_variants.some((variant) => variant.is_available),
    };
  });
}

export default async function HomeProducts({ kind }: { kind: SelectionKind }) {
  let products: Awaited<ReturnType<typeof readSelection>>;
  try {
    products = await readSelection(kind);
  } catch (error) {
    unstable_rethrow(error);
    console.error("No se pudo cargar la selección de portada:", kind);
    return (
      <SelectionFrame kind={kind}>
        <div className={styles.message}>
          <p role="alert">No pudimos cargar {kind === "recent" ? "las novedades" : "los destacados"} en este momento.</p>
          <p className="mt-2 text-sm text-black/60">Inténtalo de nuevo en unos momentos.</p>
          <HomeProductsRetry />
        </div>
      </SelectionFrame>
    );
  }

  if (!products.length && kind === "featured") return null;
  return (
    <SelectionFrame kind={kind}>
      {!products.length ? <div className={styles.message}><p className="text-lg font-semibold">Estamos preparando nuestra colección.</p><p className="mt-3 text-sm text-black/60">Pronto encontrarás nuestras primeras prendas aquí.</p></div> : (
        <div className={styles.grid}>
          {products.map((product, index) => (
            <article key={product.id} className={styles.card} style={{ animationDelay: index * 60 + "ms" }}>
              <Link href={"/catalogo/" + product.id + "?from=home&section=" + selections[kind].id} className={styles.productLink}>
                <div className={styles.photo}>
                  {product.image ? <Image src={product.image} alt={product.alt} fill unoptimized sizes="(max-width: 639px) 95vw, (max-width: 1023px) 45vw, 23vw" className={styles.image} />
                    : <span className={styles.noPhoto}>Fotografía próximamente</span>}
                  <div className={styles.badges}>
                    {product.featured && <span className={styles.badge}>Destacado</span>}
                    {product.soldOut && <span className={styles.soldOut}>Agotado</span>}
                  </div>
                </div>
                <div className={styles.info}>
                  <p className={styles.audience}>{audiences[product.audience] ?? product.audience}</p>
                  <h3 className={styles.name}>{product.name}</h3>
                  <p className={styles.price}>{currency.format(product.price)}</p>
                  <p className={styles.detail}>Ver prenda <span aria-hidden="true">↗</span></p>
                </div>
              </Link>
              <div className={styles.favorite}><FavoriteButton productId={product.id} name={product.name} /></div>
            </article>
          ))}
        </div>
      )}
    </SelectionFrame>
  );
}

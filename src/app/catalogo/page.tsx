import { Suspense } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { CatalogProduct } from "@/lib/catalog-filters";
import CatalogBrowser from "./catalog-browser";
import StoreHeader from "@/components/store-header";
import StoreFooter from "@/components/store-footer";
import styles from "@/components/store-shell.module.css";

export const metadata = {
  title: "Catálogo | LUCYNE",
  description: "Descubre las prendas de LUCYNE. Tu estilo. A tu manera.",
};

async function CatalogData() {
  const supabase = createPublicClient();
  const products: CatalogProduct[] = [];
  let offset = 0;
  let total: number | null = null;

  // Lee por lotes para no truncar el catálogo por el límite de una consulta.
  while (true) {
    const { data, error, count } = await supabase
      .from("products")
      .select("id, name, description, price, audience, created_at, product_images(id, storage_path, alt_text, sort_order, created_at), product_variants(size, color, is_available)", {
        count: offset === 0 ? "exact" : undefined,
      })
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .order("sort_order", { referencedTable: "product_images", ascending: true })
      .order("created_at", { referencedTable: "product_images", ascending: true })
      .order("id", { referencedTable: "product_images", ascending: true })
      .limit(1, { referencedTable: "product_images" })
      .range(offset, offset + 199);

    if (error) {
      console.error("Error al consultar catálogo:", error.code);
      throw new Error("No se pudo cargar el catálogo.");
    }
    if (offset === 0) total = count;
    const rows = data ?? [];
    for (const product of rows) {
      const cover = product.product_images[0];
      products.push({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        audience: product.audience,
        created_at: product.created_at,
        image_url: cover ? supabase.storage.from("product-images").getPublicUrl(cover.storage_path).data.publicUrl : null,
        image_alt: cover?.alt_text || product.name,
        variants: product.product_variants,
      });
    }
    offset += rows.length;
    if (rows.length === 0 || (total !== null && offset >= total) || (total === null && rows.length < 200)) break;
  }

  return <CatalogBrowser products={products} />;
}

export default function CatalogPage() {
  return (
    <>
    <StoreHeader active="catalog" />
    <main id="lucyne-main" tabIndex={-1} className={styles.main + " bg-[#F2F2F2] px-5 pb-16 pt-4 text-black sm:px-8 sm:pb-24 sm:pt-6"}>
      <div className="mx-auto max-w-7xl">
        <header className={styles.enter + " py-10 sm:py-14"}>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#B91C5B]">Tu estilo. A tu manera.</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-7xl">Catálogo<span className="text-[#EF2E7E]">.</span></h1>
          <p className="mt-4 max-w-xl text-black/60">Encuentra tu próxima prenda por talla, color y precio.</p>
        </header>
        <Suspense fallback={<p role="status" className="rounded-2xl bg-white p-8 text-black/60">Cargando colección…</p>}>
          <CatalogData />
        </Suspense>
      </div>
    </main>
    <StoreFooter />
    </>
  );
}

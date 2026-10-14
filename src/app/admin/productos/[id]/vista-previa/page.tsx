import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { ProductVariant } from "@/lib/catalog-types";
import ProductDetail from "@/app/catalogo/[id]/product-detail";

export const metadata = {
  title: "Vista previa privada | LUCYNE",
  robots: { index: false, follow: false },
};

type StoredPhoto = {
  id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
};
const statuses: Record<string, string> = {
  draft: "Borrador", published: "Publicado", archived: "Archivado",
};
const linkClass = "inline-flex rounded-full border border-white/25 px-4 py-2 text-xs font-semibold hover:bg-white/10";

async function PreviewContent({ params }: { params: Promise<{ id: string }> }) {
  // Se comprueba la autorización en el servidor antes de leer datos privados.
  const { supabase } = await requireAdmin();
  const { id: rawId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)) notFound();
  const id = rawId.toLowerCase();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, description, price, audience, status, product_images(id, storage_path, alt_text, sort_order, created_at), product_variants(id, size, color, color_hex, is_available)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("No se pudo cargar la vista previa.");
  if (!product) notFound();
  const variants = (product.product_variants ?? []) as ProductVariant[];
  const photos = [...((product.product_images ?? []) as StoredPhoto[])]
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))
    .map((photo) => ({
      id: photo.id,
      url: supabase.storage.from("product-images").getPublicUrl(photo.storage_path).data.publicUrl,
      alt: photo.alt_text || product.name,
    }));
  const notices: string[] = [];
  if (!photos.length) notices.push("Este producto todavía no tiene fotos.");
  if (!variants.length) notices.push("Falta configurar sus tallas y colores.");
  else if (!variants.some((variant) => variant.is_available)) notices.push("Todas sus variantes están agotadas.");
  if (!product.description.trim()) notices.push("Puedes añadir una descripción para completar la ficha.");

  return (
    <>
      <aside aria-label="Controles de vista previa" className="bg-black px-5 py-5 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold">Vista previa privada <span className="ml-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs">{statuses[product.status] ?? product.status}</span></p>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/70">
                Estás revisando la última versión guardada. Esta vista no publica el producto.
                {product.status === "published" ? " La ficha pública ya está visible en la tienda." : " La ficha no está visible en el catálogo público."}
              </p>
            </div>
            <nav aria-label="Administrar este producto" className="flex flex-wrap gap-2">
              <Link href={"/admin/productos/" + id + "/editar"} className={linkClass}>Editar producto</Link>
              <Link href={"/admin/productos/" + id + "/fotos"} className={linkClass}>Fotos</Link>
              <Link href={"/admin/productos/" + id + "/variantes"} className={linkClass}>Variantes</Link>
              {product.status === "published" && <Link href={"/catalogo/" + id} className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-pink-100">Ver ficha pública →</Link>}
            </nav>
          </div>
          {notices.length > 0 && (
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="text-xs font-bold text-pink-200">Para revisar</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-relaxed text-white/80">
                {notices.map((notice) => <li key={notice}>{notice}</li>)}
              </ul>
            </div>
          )}
        </div>
      </aside>
      <ProductDetail
        key={product.id}
        name={product.name}
        description={product.description}
        price={Number(product.price)}
        audience={product.audience}
        photos={photos}
        variants={variants}
        preview
      />
    </>
  );
}

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F2F2F2] p-10"><p role="status">Preparando vista previa…</p></main>}>
      <PreviewContent params={params} />
    </Suspense>
  );
}

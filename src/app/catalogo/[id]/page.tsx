import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import type { ProductVariant } from "@/lib/catalog-types";
import ProductDetail from "./product-detail";

export const metadata = {
  title: "Detalle de producto | LUCYNE",
  description: "Fotografías, tallas y colores de las prendas LUCYNE.",
};

type StoredPhoto = {
  id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
};

async function ProductContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const supabase = createPublicClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, description, price, audience, product_images(id, storage_path, alt_text, sort_order, created_at), product_variants(id, size, color, color_hex, is_available)")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error("No se pudo cargar el producto.");
  if (!product) notFound();
  const photos = [...(product.product_images as StoredPhoto[])]
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))
    .map((photo) => ({
      id: photo.id,
      url: supabase.storage.from("product-images").getPublicUrl(photo.storage_path).data.publicUrl,
      alt: photo.alt_text || product.name,
    }));
  return (
    <ProductDetail
      productId={product.id}
      name={product.name}
      description={product.description}
      price={Number(product.price)}
      audience={product.audience}
      photos={photos}
      variants={product.product_variants as ProductVariant[]}
    />
  );
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F2F2F2] p-10"><p role="status">Cargando producto…</p></main>}>
      <ProductContent params={params} />
    </Suspense>
  );
}

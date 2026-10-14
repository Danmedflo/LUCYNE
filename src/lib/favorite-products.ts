import { createPublicClient } from "@/lib/supabase/public";
import { parseFavorites } from "@/lib/favorites-store";

export type FavoriteProduct = {
  id: string;
  name: string;
  price: number;
  audience: string;
  image_url: string | null;
  image_alt: string;
  has_variants: boolean;
  has_available: boolean;
};

export async function loadFavoriteProducts(ids: string[], signal: AbortSignal): Promise<FavoriteProduct[]> {
  const safeIds = parseFavorites(JSON.stringify(ids));
  if (!safeIds.length) return [];
  // Cliente anónimo: incluso un administrador consulta aquí solo la tienda pública.
  const supabase = createPublicClient();
  const products: FavoriteProduct[] = [];
  for (let offset = 0; offset < safeIds.length; offset += 25) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, audience, product_images(id, storage_path, alt_text, sort_order, created_at), product_variants(is_available)")
      .eq("status", "published")
      .in("id", safeIds.slice(offset, offset + 25))
      .order("sort_order", { referencedTable: "product_images", ascending: true })
      .order("created_at", { referencedTable: "product_images", ascending: true })
      .order("id", { referencedTable: "product_images", ascending: true })
      .limit(1, { referencedTable: "product_images" })
      .abortSignal(signal);
    if (error) throw new Error("No pudimos cargar tus prendas. Inténtalo nuevamente.");
    for (const product of data ?? []) {
      const cover = product.product_images?.[0];
      const variants = product.product_variants ?? [];
      products.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        audience: product.audience,
        image_url: cover ? supabase.storage.from("product-images").getPublicUrl(cover.storage_path).data.publicUrl : null,
        image_alt: cover?.alt_text || product.name,
        has_variants: variants.length > 0,
        has_available: variants.some((variant) => variant.is_available),
      });
    }
  }
  const byId = new Map(products.map((product) => [product.id, product]));
  return safeIds.flatMap((id) => byId.has(id) ? [byId.get(id)!] : []);
}

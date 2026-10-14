export type ProductStatus = "draft" | "published" | "archived";
export type ProductAudience = "mujer" | "hombre" | "unisex";
export type ProductIssue = "" | "photos" | "variants" | "sold-out";
export type DashboardProduct = {
  id: string;
  name: string;
  price: number;
  status: ProductStatus;
  audience: ProductAudience;
  created_at: string;
  image_url: string | null;
  image_alt: string;
  photo_count: number;
  variant_count: number;
  available_count: number;
};
export type DashboardFilters = {
  q: string;
  status: "" | ProductStatus;
  audience: "" | ProductAudience;
  issue: ProductIssue;
  sort: "recent" | "name" | "price-asc" | "price-desc";
};
export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  q: "", status: "", audience: "", issue: "", sort: "recent",
};
export const DASHBOARD_PAGE_SIZE = 12;
export const STATUS_LABELS: Record<ProductStatus, string> = {
  published: "Publicado", draft: "Borrador", archived: "Archivado",
};
export const AUDIENCE_LABELS: Record<ProductAudience, string> = {
  mujer: "Mujer", hombre: "Hombre", unisex: "Unisex",
};
export function isSoldOut(product: DashboardProduct) {
  return product.variant_count > 0 && product.available_count === 0;
}
export function dashboardTotals(products: DashboardProduct[]) {
  return {
    total: products.length,
    published: products.filter((p) => p.status === "published").length,
    draft: products.filter((p) => p.status === "draft").length,
    archived: products.filter((p) => p.status === "archived").length,
    photos: products.filter((p) => p.photo_count === 0).length,
    variants: products.filter((p) => p.variant_count === 0).length,
    soldOut: products.filter(isSoldOut).length,
  };
}
function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}
export function filterDashboard(products: DashboardProduct[], filters: DashboardFilters) {
  const words = normalize(filters.q).split(/\s+/).filter(Boolean);
  const result = products.filter((product) => {
    if (!words.every((word) => normalize(product.name).includes(word))) return false;
    if (filters.status && product.status !== filters.status) return false;
    if (filters.audience && product.audience !== filters.audience) return false;
    if (filters.issue === "photos" && product.photo_count !== 0) return false;
    if (filters.issue === "variants" && product.variant_count !== 0) return false;
    if (filters.issue === "sold-out" && !isSoldOut(product)) return false;
    return true;
  });
  const recent = (a: DashboardProduct, b: DashboardProduct) =>
    Date.parse(b.created_at) - Date.parse(a.created_at) || a.id.localeCompare(b.id);
  return result.sort((a, b) => {
    if (filters.sort === "name") return a.name.localeCompare(b.name, "es", { sensitivity: "base" }) || recent(a, b);
    if (filters.sort === "price-asc") return a.price - b.price || recent(a, b);
    if (filters.sort === "price-desc") return b.price - a.price || recent(a, b);
    return recent(a, b);
  });
}

import { CATEGORY_ID } from "./categories";

export type CatalogVariant = {
  size: string;
  color: string;
  is_available: boolean;
};

export type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  audience: string;
  created_at: string;
  image_url: string | null;
  image_alt: string;
  category_id: string | null;
  category_name: string | null;
  featured: boolean;
  variants: CatalogVariant[];
};

export type CatalogFilters = {
  q: string;
  category: string;
  featured: boolean;
  audience: string;
  size: string;
  color: string;
  min: string;
  max: string;
  available: boolean;
  sort: string;
  page: number;
};

export const DEFAULT_FILTERS: CatalogFilters = {
  category: "", featured: false, q: "", audience: "", size: "", color: "", min: "", max: "",
  available: false, sort: "recent", page: 1,
};
export const PAGE_SIZE = 12;

export function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function parsePrice(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  return /^\d{1,6}(\.\d{1,2})?$/.test(normalized) ? Number(normalized) : null;
}

export function readFilters(params: { get(name: string): string | null }): CatalogFilters {
  const min = (params.get("min") ?? "").slice(0, 12);
  const max = (params.get("max") ?? "").slice(0, 12);
  const audience = params.get("audience") ?? "";
  const sort = params.get("sort") ?? "";
  const rawPage = params.get("page") ?? "1";
  return {
    category: CATEGORY_ID.test(params.get("category") ?? "") ? params.get("category")!.toLowerCase() : "",
    featured: params.get("featured") === "1",
    q: (params.get("q") ?? "").trim().slice(0, 120),
    audience: ["mujer", "hombre", "unisex"].includes(audience) ? audience : "",
    size: normalizeText((params.get("size") ?? "").slice(0, 20)),
    color: normalizeText((params.get("color") ?? "").slice(0, 60)),
    min: parsePrice(min) === null ? "" : min.replace(",", "."),
    max: parsePrice(max) === null ? "" : max.replace(",", "."),
    available: params.get("available") === "1",
    sort: ["price_asc", "price_desc"].includes(sort) ? sort : "recent",
    page: /^\d{1,6}$/.test(rawPage) ? Math.max(1, Number(rawPage)) : 1,
  };
}

export function filtersQuery(filters: CatalogFilters) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.featured) params.set("featured", "1");
  if (filters.audience) params.set("audience", filters.audience);
  if (filters.size) params.set("size", filters.size);
  if (filters.color) params.set("color", filters.color);
  if (filters.min.trim()) params.set("min", filters.min.trim().replace(",", "."));
  if (filters.max.trim()) params.set("max", filters.max.trim().replace(",", "."));
  if (filters.available) params.set("available", "1");
  if (filters.sort !== "recent") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function variantMatches(variant: CatalogVariant, filters: CatalogFilters) {
  return (!filters.size || normalizeText(variant.size) === filters.size)
    && (!filters.color || normalizeText(variant.color) === filters.color);
}

export function filterCatalog(products: CatalogProduct[], filters: CatalogFilters) {
  const words = normalizeText(filters.q).split(" ").filter(Boolean);
  const min = parsePrice(filters.min);
  const max = parsePrice(filters.max);
  const filtered = products.filter((product) => {
    const searchable = normalizeText(product.name + " " + product.description);
    if (!words.every((word) => searchable.includes(word))) return false;
    if (filters.category && product.category_id !== filters.category) return false;
    if (filters.featured && !product.featured) return false;
    if (filters.audience && product.audience !== filters.audience) return false;
    if (min !== null && product.price < min) return false;
    if (max !== null && product.price > max) return false;
    if (filters.size || filters.color || filters.available) {
      return product.variants.some((variant) =>
        variantMatches(variant, filters) && (!filters.available || variant.is_available)
      );
    }
    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === "price_asc" && a.price !== b.price) return a.price - b.price;
    if (filters.sort === "price_desc" && a.price !== b.price) return b.price - a.price;
    return Date.parse(b.created_at) - Date.parse(a.created_at) || a.id.localeCompare(b.id);
  });
}

export function filterOptions(products: CatalogProduct[], field: "size" | "color") {
  const options = new Map<string, string>();
  for (const product of products) {
    for (const variant of product.variants) {
      const label = variant[field].trim();
      const value = normalizeText(label);
      if (value && !options.has(value)) options.set(value, label);
    }
  }
  const sizeOrder = ["xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl"];
  return [...options].map(([value, label]) => ({ value, label })).sort((a, b) => {
    const ia = sizeOrder.indexOf(a.value);
    const ib = sizeOrder.indexOf(b.value);
    if (field === "size" && (ia >= 0 || ib >= 0)) {
      if (ia < 0) return 1;
      if (ib < 0) return -1;
      return ia - ib;
    }
    return a.label.localeCompare(b.label, "es", { numeric: true });
  });
}

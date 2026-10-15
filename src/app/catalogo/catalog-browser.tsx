"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FavoriteButton } from "@/components/favorites";
import {
  DEFAULT_FILTERS, PAGE_SIZE, filterCatalog, filterOptions, filtersQuery,
  parsePrice, readFilters, variantMatches,
  type CatalogFilters, type CatalogProduct,
} from "@/lib/catalog-filters";

const currency = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const audienceLabels: Record<string, string> = { mujer: "Mujer", hombre: "Hombre", unisex: "Unisex" };
type Option = { value: string; label: string };

function FilterForm({
  initial, sizes, colors, onApply, onReset,
}: {
  initial: CatalogFilters;
  sizes: Option[];
  colors: Option[];
  onApply: (filters: CatalogFilters) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const inputClass = "mt-2 w-full min-w-0 rounded-xl border border-black/15 bg-white px-3 py-3 text-sm outline-none focus:border-[#EF2E7E] focus:ring-2 focus:ring-[#EF2E7E]/20";
  return (
    <form
      role="search"
      aria-label="Buscar y filtrar prendas"
      onSubmit={(event) => {
        event.preventDefault();
        const min = parsePrice(draft.min);
        const max = parsePrice(draft.max);
        if ((draft.min.trim() && min === null) || (draft.max.trim() && max === null)) {
          setError("Ingresa precios válidos, como 59.90.");
          return;
        }
        if (min !== null && max !== null && min > max) {
          setError("El precio mínimo no puede superar al máximo.");
          return;
        }
        setError("");
        onApply({ ...draft, page: 1 });
      }}
      className="mb-8 rounded-3xl border border-black/10 bg-white p-5 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <label htmlFor="catalog-q" className="text-xs font-bold">Buscar prenda</label>
          <input id="catalog-q" type="search" maxLength={120} value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} placeholder="Polo, casaca, algodón…" className={inputClass} />
        </div>
        <div>
          <label htmlFor="catalog-audience" className="text-xs font-bold">Público</label>
          <select id="catalog-audience" value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value })} className={inputClass}>
            <option value="">Todos</option><option value="mujer">Mujer</option><option value="hombre">Hombre</option><option value="unisex">Unisex</option>
          </select>
        </div>
        <div>
          <label htmlFor="catalog-size" className="text-xs font-bold">Talla</label>
          <select id="catalog-size" value={draft.size} onChange={(e) => setDraft({ ...draft, size: e.target.value })} className={inputClass}>
            <option value="">Todas</option>
            {draft.size && !sizes.some((option) => option.value === draft.size) && <option value={draft.size}>{draft.size} · sin resultados</option>}
            {sizes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="catalog-color" className="text-xs font-bold">Color</label>
          <select id="catalog-color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} className={inputClass}>
            <option value="">Todos</option>
            {draft.color && !colors.some((option) => option.value === draft.color) && <option value={draft.color}>{draft.color} · sin resultados</option>}
            {colors.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_1.3fr]">
        <div>
          <label htmlFor="catalog-min" className="text-xs font-bold">Precio mínimo · S/</label>
          <input id="catalog-min" inputMode="decimal" maxLength={9} value={draft.min} onChange={(e) => setDraft({ ...draft, min: e.target.value })} placeholder="Desde" className={inputClass} />
        </div>
        <div>
          <label htmlFor="catalog-max" className="text-xs font-bold">Precio máximo · S/</label>
          <input id="catalog-max" inputMode="decimal" maxLength={9} value={draft.max} onChange={(e) => setDraft({ ...draft, max: e.target.value })} placeholder="Hasta" className={inputClass} />
        </div>
        <div>
          <label htmlFor="catalog-sort" className="text-xs font-bold">Ordenar por</label>
          <select id="catalog-sort" value={draft.sort} onChange={(e) => setDraft({ ...draft, sort: e.target.value })} className={inputClass}>
            <option value="recent">Más recientes</option><option value="price_asc">Menor precio</option><option value="price_desc">Mayor precio</option>
          </select>
        </div>
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl bg-[#F7F7F7] px-4 py-3 text-sm font-semibold">
          <input type="checkbox" checked={draft.available} onChange={(e) => setDraft({ ...draft, available: e.target.checked })} className="h-4 w-4 accent-[#B91C5B]" />
          Solo disponibles
        </label>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="submit" className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-[#B91C5B]">Buscar y filtrar</button>
        <button type="button" onClick={() => { setDraft({ ...DEFAULT_FILTERS }); setError(""); onReset(); }} className="rounded-full px-5 py-3 text-sm font-semibold text-black/60 hover:bg-black/5">Limpiar filtros</button>
      </div>
    </form>
  );
}

export default function CatalogBrowser({ products }: { products: CatalogProduct[] }) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const filters = useMemo(() => readFilters(new URLSearchParams(query)), [query]);
  const filtered = useMemo(() => filterCatalog(products, filters), [products, filters]);
  const sizes = useMemo(() => filterOptions(products, "size"), [products]);
  const colors = useMemo(() => filterOptions(products, "color"), [products]);
  const categories = useMemo(() => {
    const names = new Map<string, string>();
    for (const product of products) {
      if (product.category_id && product.category_name) names.set(product.category_id, product.category_name);
    }
    return [...names].sort((a, b) => a[1].localeCompare(b[1], "es"));
  }, [products]);
  const featuredCount = products.filter((product) => product.featured).length;
  const chipClass = (active: boolean) => "rounded-full border px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B91C5B] " + (active ? "border-black bg-black text-white" : "border-black/15 bg-white text-black/65 hover:border-[#B91C5B] hover:text-[#B91C5B]");
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const returnQuery = filtersQuery({ ...filters, page });

  function navigate(next: CatalogFilters, scroll = false) {
    const nextQuery = filtersQuery(next);
    window.history.pushState(null, "", "/catalogo" + (nextQuery ? "?" + nextQuery : ""));
    if (scroll) document.getElementById("catalog-results")?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  if (!products.length) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white px-6 py-20 text-center">
        <h2 className="text-2xl font-bold">Estamos preparando nuestra colección.</h2>
        <p className="mt-3 text-black/60">Pronto encontrarás nuestras primeras prendas aquí.</p>
      </div>
    );
  }

  return (
    <>
      <section aria-label="Explorar la colección" className="mb-7 space-y-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Selección de productos">
          <button type="button" aria-pressed={!filters.featured} onClick={() => navigate({ ...filters, featured: false, page: 1 })} className={chipClass(!filters.featured)}>Toda la colección</button>
          <button type="button" aria-pressed={filters.featured} onClick={() => navigate({ ...filters, featured: true, page: 1 })} className={chipClass(filters.featured)}>Destacados <span className="ml-2 text-xs opacity-70">{featuredCount}</span></button>
        </div>
        {categories.length > 0 && <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-black/50">Encuentra tu estilo</p>
          <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={!filters.category} onClick={() => navigate({ ...filters, category: "", page: 1 })} className={chipClass(!filters.category)}>Todas las categorías</button>
            {categories.map(([id, name]) => <button key={id} type="button" aria-pressed={filters.category === id} onClick={() => navigate({ ...filters, category: id, page: 1 })} className={chipClass(filters.category === id)}>{name}</button>)}
          </div>
        </div>}
      </section>
      <FilterForm key={query} initial={filters} sizes={sizes} colors={colors} onApply={(next) => navigate(next)} onReset={() => navigate({ ...DEFAULT_FILTERS })} />
      <section id="catalog-results" aria-label="Resultados del catálogo" className="scroll-mt-28">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p role="status" aria-live="polite" className="text-sm text-black/60">
            {filtered.length === 0 ? "No encontramos coincidencias." : "Mostrando " + (start + 1) + "–" + Math.min(start + PAGE_SIZE, filtered.length) + " de " + filtered.length + (filtered.length === 1 ? " producto" : " productos")}
          </p>
          {pages > 1 && <p className="text-xs font-semibold text-black/50">Página {page} de {pages}</p>}
        </div>
        {visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/20 bg-white/60 p-12 text-center">
            <h2 className="text-xl font-bold">Probemos otra combinación.</h2>
            <p className="mt-3 text-sm text-black/60">Prueba otra categoría o ajusta los filtros para ver más prendas.</p>
            <button type="button" onClick={() => navigate({ ...DEFAULT_FILTERS })} className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Ver toda la colección</button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((product) => {
              const hasMatchAvailable = product.variants.some((variant) => variantMatches(variant, filters) && variant.is_available);
              const soldOut = product.variants.length > 0 && !hasMatchAvailable;
              const href = "/catalogo/" + product.id + (returnQuery ? "?" + returnQuery : "");
              return (
                <article key={product.id} className="flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white">
                  <Link href={href} className="group block flex-1">
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#FAFAFA]">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.image_alt} fill unoptimized sizes="(max-width: 640px) 95vw, (max-width: 1024px) 45vw, 300px" className="object-contain p-3 transition-transform duration-300 motion-safe:group-hover:scale-[1.03]" />
                      ) : <div className="flex h-full items-center justify-center text-sm text-black/50">Fotografía próximamente</div>}
                      {product.featured && <span className="absolute right-3 top-3 rounded-full bg-[#B91C5B] px-3 py-1 text-xs font-semibold text-white">Destacado</span>}
                      {soldOut && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-black/65">{filters.size || filters.color ? "Combinación agotada" : "Agotado"}</span>}
                    </div>
                    <div className="p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B91C5B]">{audienceLabels[product.audience] ?? product.audience}{product.category_name ? " · " + product.category_name : ""}</p>
                      <h2 className="mt-2 break-words text-lg font-bold">{product.name}</h2>
                      {product.description && <p className="mt-2 line-clamp-2 break-words text-sm leading-relaxed text-black/60">{product.description}</p>}
                      <p className="mt-4 text-xl font-black">{currency.format(product.price)}</p>
                      <p className="mt-4 text-sm font-semibold text-[#B91C5B]">Ver tallas y colores →</p>
                    </div>
                  </Link>
                  <div className="border-t border-black/5 px-5 py-4"><FavoriteButton productId={product.id} name={product.name} /></div>
                </article>
              );
            })}
          </div>
        )}
        {pages > 1 && (
          <nav aria-label="Páginas del catálogo" className="mt-10 flex items-center justify-center gap-4">
            <button type="button" disabled={page <= 1} onClick={() => navigate({ ...filters, page: page - 1 }, true)} className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-35">Anterior</button>
            <span className="text-sm font-semibold">{page} / {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => navigate({ ...filters, page: page + 1 }, true)} className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-35">Siguiente</button>
          </nav>
        )}
      </section>
    </>
  );
}

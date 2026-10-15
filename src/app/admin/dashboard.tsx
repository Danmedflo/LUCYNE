"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AUDIENCE_LABELS, STATUS_LABELS, DEFAULT_DASHBOARD_FILTERS,
  DASHBOARD_PAGE_SIZE, dashboardTotals, filterDashboard, isSoldOut,
  type DashboardFilters, type DashboardProduct, type ProductIssue,
  type ProductStatus,
} from "@/lib/admin-dashboard";
import styles from "./dashboard.module.css";

const currency = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const inputClass = "mt-2 w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm font-normal focus:outline-2 focus:outline-offset-2 focus:outline-[#B91C5B]";
const actionClass = "inline-flex items-center justify-center rounded-full border border-black/15 px-4 py-2 text-xs font-semibold hover:border-[#B91C5B] hover:bg-pink-50 hover:text-[#B91C5B]";

export default function Dashboard({ products }: { products: DashboardProduct[] }) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_DASHBOARD_FILTERS);
  const [page, setPage] = useState(1);
  const totals = useMemo(() => dashboardTotals(products), [products]);
  const filtered = useMemo(() => filterDashboard(products, filters), [products, filters]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / DASHBOARD_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * DASHBOARD_PAGE_SIZE;
  const visible = filtered.slice(start, start + DASHBOARD_PAGE_SIZE);
  const hasFilters = !!(filters.q || filters.status || filters.audience || filters.issue || filters.sort !== "recent");

  function updateFilters(patch: Partial<DashboardFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }
  function selectSummary(patch: Partial<DashboardFilters>) {
    setFilters({ ...DEFAULT_DASHBOARD_FILTERS, ...patch });
    setPage(1);
  }
  const metrics: { label: string; count: number; status: "" | ProductStatus; detail: string }[] = [
    { label: "Total de productos", count: totals.total, status: "", detail: "Toda tu colección" },
    { label: "Publicados", count: totals.published, status: "published", detail: "Visibles en la tienda" },
    { label: "Borradores", count: totals.draft, status: "draft", detail: "Pendientes de publicar" },
    { label: "Archivados", count: totals.archived, status: "archived", detail: "Fuera del catálogo público" },
  ];
  const issues: { label: string; count: number; value: ProductIssue }[] = [
    { label: "Sin fotos", count: totals.photos, value: "photos" },
    { label: "Sin variantes", count: totals.variants, value: "variants" },
    { label: "Todas las variantes agotadas", count: totals.soldOut, value: "sold-out" },
  ];

  return (
    <div className="mt-8 space-y-6">
      <section aria-label="Resumen de todo el catálogo" className={styles.enter} style={{ animationDelay: "60ms" }}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map((metric) => {
            const active = filters.status === metric.status && !filters.q && !filters.audience && !filters.issue;
            return (
              <button type="button" key={metric.label} onClick={() => selectSummary({ status: metric.status })} aria-pressed={active}
                className={"rounded-3xl border p-5 text-left transition-colors sm:p-6 " + (active ? "border-black bg-black text-white" : "border-black/10 bg-white hover:border-[#B91C5B]/40")}>
                <span className={"text-xs font-semibold sm:text-sm " + (active ? "text-white/75" : "text-black/60")}>{metric.label}</span>
                <span className="mt-3 block text-4xl font-black tracking-tight sm:text-5xl">{metric.count}</span>
                <span className={"mt-3 block text-xs " + (active ? "text-white/65" : "text-black/50")}>{metric.detail}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-black/55">Cifras de todo el catálogo. Pulsa una tarjeta para filtrar la lista.</p>
      </section>

      <section aria-labelledby="attention-title" className={styles.enter + " rounded-3xl border border-[#B91C5B]/15 bg-[#FFF5F9] p-5 sm:p-6"} style={{ animationDelay: "120ms" }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="attention-title" className="text-base font-bold">Revisa tu colección</h2>
            <p className="mt-1 text-sm text-black/60">Atajos para completar productos y revisar su disponibilidad.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {issues.map((issue) => (
              <button type="button" key={issue.value} onClick={() => selectSummary({ issue: issue.value })} aria-pressed={filters.issue === issue.value}
                className={"rounded-full border px-4 py-2 text-xs font-semibold " + (filters.issue === issue.value ? "border-[#B91C5B] bg-[#B91C5B] text-white" : "border-[#B91C5B]/15 bg-white text-[#B91C5B] hover:border-[#B91C5B]")}>
                {issue.label} · {issue.count}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-black/55">Incluye todos los estados. Un producto puede aparecer en más de un aviso. “Sin variantes” no significa “agotado”.</p>
      </section>

      <section aria-labelledby="products-title" className={styles.enter + " overflow-hidden rounded-3xl border border-black/10 bg-white"} style={{ animationDelay: "180ms" }}>
        <div className="border-b border-black/10 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="products-title" className="text-xl font-bold">Tus productos</h2>
            <button type="button" disabled={refreshing} onClick={() => startRefresh(() => router.refresh())} className={actionClass + " disabled:cursor-wait disabled:opacity-50"}>
              {refreshing ? "Actualizando…" : "Actualizar datos"}
            </button>
          </div>
          <div role="search" aria-label="Buscar y filtrar productos" className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <label className="text-xs font-semibold xl:col-span-2">
              Buscar por nombre
              <input type="search" value={filters.q} maxLength={120} onChange={(event) => updateFilters({ q: event.target.value })} placeholder="Ej. polo oversize" className={inputClass} />
            </label>
            <label className="text-xs font-semibold">
              Estado
              <select value={filters.status} onChange={(event) => updateFilters({ status: event.target.value as DashboardFilters["status"] })} className={inputClass}>
                <option value="">Todos los estados</option><option value="published">Publicado</option><option value="draft">Borrador</option><option value="archived">Archivado</option>
              </select>
            </label>
            <label className="text-xs font-semibold">
              Colección
              <select value={filters.audience} onChange={(event) => updateFilters({ audience: event.target.value as DashboardFilters["audience"] })} className={inputClass}>
                <option value="">Todas</option><option value="mujer">Mujer</option><option value="hombre">Hombre</option><option value="unisex">Unisex</option>
              </select>
            </label>
            <label className="text-xs font-semibold">
              Revisar
              <select value={filters.issue} onChange={(event) => updateFilters({ issue: event.target.value as ProductIssue })} className={inputClass}>
                <option value="">Todos los productos</option><option value="photos">Sin fotos</option><option value="variants">Sin variantes</option><option value="sold-out">Variantes agotadas</option>
              </select>
            </label>
            <label className="text-xs font-semibold">
              Ordenar
              <select value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value as DashboardFilters["sort"] })} className={inputClass}>
                <option value="recent">Más recientes</option><option value="name">Nombre A–Z</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-black/60">
              {filtered.length === 0 ? "0 productos" : String(start + 1) + "–" + String(Math.min(start + DASHBOARD_PAGE_SIZE, filtered.length)) + " de " + String(filtered.length) + " productos"}
              {hasFilters ? " · filtros activos" : ""}
            </p>
            {hasFilters && <button type="button" onClick={() => selectSummary({})} className="text-xs font-semibold text-[#B91C5B] hover:underline">Limpiar filtros y orden</button>}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="text-lg font-bold">{products.length === 0 ? "Tu colección empieza aquí." : "No encontramos productos con esos filtros."}</h3>
            <p className="mt-2 text-sm text-black/60">{products.length === 0 ? "Agrega tu primera prenda y prepara su ficha." : "Prueba otro nombre o limpia los filtros."}</p>
            {products.length === 0
              ? <Link href="/admin/productos/nuevo" className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-[#B91C5B]">+ Agregar producto</Link>
              : <button type="button" onClick={() => selectSummary({})} className={"mt-6 " + actionClass}>Ver todos los productos</button>}
          </div>
        ) : (
          <ul className="divide-y divide-black/10">
            {visible.map((product) => (
              <li key={product.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <Link href={"/admin/productos/" + product.id + "/fotos"} aria-label={"Gestionar fotos de " + product.name} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F2F2F2]">
                      {product.image_url
                        ? <Image src={product.image_url} alt={product.image_alt} fill unoptimized sizes="80px" className="object-cover" />
                        : <span className="flex h-full items-center justify-center text-xs font-semibold text-black/40">Sin foto</span>}
                    </Link>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={"rounded-full px-2.5 py-1 text-[11px] font-semibold " + (product.status === "published" ? "bg-emerald-50 text-emerald-800" : product.status === "draft" ? "bg-amber-50 text-amber-900" : "bg-black/5 text-black/60")}>{STATUS_LABELS[product.status]}</span>
                        {product.featured && <span className="rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-semibold text-[#B91C5B]">Destacado</span>}
                        <span className="text-xs text-black/50">{AUDIENCE_LABELS[product.audience]}</span>
                      </div>
                      <h3 className="mt-2 break-words text-base font-bold">
                        <Link href={"/admin/productos/" + product.id + "/editar"} className="hover:text-[#B91C5B]">{product.name}</Link>
                      </h3>
                      <p className="mt-1 text-sm font-semibold">{currency.format(product.price)}</p>
                      {product.status === "published" && <Link href={"/catalogo/" + product.id} className="mt-2 inline-block text-xs font-semibold text-[#B91C5B] hover:underline">Ver ficha pública →</Link>}
                    </div>
                  </div>
                  <div className="text-xs leading-relaxed text-black/60 lg:w-44 lg:shrink-0">
                    <p>{product.photo_count} {product.photo_count === 1 ? "foto" : "fotos"} · {product.variant_count} {product.variant_count === 1 ? "variante" : "variantes"}</p>
                    <p className={"mt-1 font-semibold " + (product.variant_count === 0 || isSoldOut(product) ? "text-amber-900" : "text-emerald-800")}>
                      {product.variant_count === 0 ? "Variantes por configurar" : isSoldOut(product) ? "Todas agotadas" : String(product.available_count) + " variantes disponibles"}
                    </p>
                    {product.photo_count === 0 && <p className="mt-1 text-[#B91C5B]">Agrega una foto de portada.</p>}
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Link href={"/admin/productos/" + product.id + "/vista-previa"} className={actionClass} aria-label={"Vista previa de " + product.name}>Vista previa</Link>
                    <Link href={"/admin/productos/" + product.id + "/fotos"} className={actionClass} aria-label={"Fotos de " + product.name}>Fotos</Link>
                    <Link href={"/admin/productos/" + product.id + "/variantes"} className={actionClass} aria-label={"Variantes de " + product.name}>Variantes</Link>
                    <Link href={"/admin/productos/" + product.id + "/editar"} className="inline-flex items-center rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-[#B91C5B]" aria-label={"Editar " + product.name}>Editar</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {pageCount > 1 && (
          <nav aria-label="Páginas de productos" className="flex flex-wrap items-center justify-between gap-4 border-t border-black/10 p-5 sm:p-6">
            <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className={actionClass + " disabled:cursor-not-allowed disabled:opacity-40"}>← Anterior</button>
            <span className="text-xs text-black/60">Página {currentPage} de {pageCount}</span>
            <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className={actionClass + " disabled:cursor-not-allowed disabled:opacity-40"}>Siguiente →</button>
          </nav>
        )}
      </section>
    </div>
  );
}

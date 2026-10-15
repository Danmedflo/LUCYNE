"use client";

import Link from "next/link";
import type { Category } from "@/lib/categories";

export default function ProductOrganizationFields({ categories, categoryId, featured, onCategory, onFeatured }: {
  categories: Category[];
  categoryId: string;
  featured: boolean;
  onCategory: (value: string) => void;
  onFeatured: (value: boolean) => void;
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-black/10 bg-[#FAFAFA] p-5">
      <div>
        <label htmlFor="category_id" className="text-sm font-semibold">Categoría</label>
        <select id="category_id" name="category_id" value={categoryId} onChange={(e) => onCategory(e.target.value)}
          className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#B91C5B] focus:ring-2 focus:ring-pink-100">
          <option value="">Sin categoría</option>
          {categoryId && !categories.some((category) => category.id === categoryId) && <option value={categoryId}>Categoría no disponible</option>}
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <p className="mt-2 text-xs leading-relaxed text-black/60">Organiza tus prendas por tipo: polos, pantalones, casacas…</p>
        <Link href="/admin/categorias" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-[#B91C5B] underline underline-offset-4">Gestionar categorías (nueva pestaña)</Link>
        <p className="mt-1 text-xs text-black/50">Si creas una categoría, guarda tus cambios antes de recargar este formulario.</p>
      </div>
      <label className="flex cursor-pointer items-start gap-3 border-t border-black/10 pt-5">
        <input name="featured" type="checkbox" checked={featured} onChange={(e) => onFeatured(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#B91C5B]" />
        <span><span className="block text-sm font-semibold">Destacar producto</span><span className="mt-1 block text-xs leading-relaxed text-black/60">Aparecerá en la selección de destacados cuando esté publicado.</span></span>
      </label>
    </div>
  );
}

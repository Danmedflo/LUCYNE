"use client";

import Link from "next/link";
import type { Category } from "@/lib/categories";
import ProductOrganizationFields from "@/components/product-organization-fields";
import { useActionState, useState, type ChangeEvent } from "react";
import { updateProductAction } from "./actions";

type EditableProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  audience: string;
  status: string;
  updated_at: string;
  category_id: string | null;
  featured: boolean;
};

const statusDescriptions: Record<string, string> = {
  draft: "Solo se verá en el administrador mientras preparas la prenda.",
  published: "Será visible en el catálogo y tendrá su ficha pública.",
  archived: "Se retirará del catálogo. Podrás volver a publicarlo cuando quieras.",
};

export default function EditForm({ product, categories }: { product: EditableProduct; categories: Category[] }) {
  const action = updateProductAction.bind(null, product.id, product.updated_at);
  const [state, formAction, pending] = useActionState(action, { error: "" });
  const [values, setValues] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toFixed(2),
    audience: product.audience,
    status: product.status,
    category_id: product.category_id ?? "",
    featured: product.featured,
  });
  const [showServerError, setShowServerError] = useState(true);

  function change(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setShowServerError(false);
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 " +
    "outline-none focus:border-[#EF2E7E] focus:ring-2 focus:ring-[#EF2E7E]/20";

  return (
    <form
      action={formAction}
      onSubmit={() => setShowServerError(true)}
      aria-busy={pending}
      className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8"
    >
      <fieldset disabled={pending} className="space-y-6">
        <div>
          <label htmlFor="name" className="text-sm font-semibold">Nombre del producto</label>
          <input id="name" name="name" required minLength={2} maxLength={120} value={values.name} onChange={change} className={inputClass} />
        </div>
        <div>
          <label htmlFor="description" className="text-sm font-semibold">Descripción</label>
          <textarea id="description" name="description" rows={5} maxLength={3000} value={values.description} onChange={change} className={inputClass + " resize-y"} />
          <p className="mt-2 text-xs text-black/60">Opcional. Hasta 3000 caracteres.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="text-sm font-semibold">Precio en soles</label>
            <input id="price" name="price" type="text" inputMode="decimal" required maxLength={9} value={values.price} onChange={change} className={inputClass} />
          </div>
          <div>
            <label htmlFor="audience" className="text-sm font-semibold">Público</label>
            <select id="audience" name="audience" value={values.audience} onChange={change} className={inputClass}>
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl bg-[#F7F7F7] p-5">
          <label htmlFor="status" className="text-sm font-semibold">Estado del producto</label>
          <select id="status" name="status" value={values.status} onChange={change} aria-describedby="status-description" className={inputClass}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
          <p id="status-description" className="mt-3 text-sm leading-relaxed text-black/60">
            {statusDescriptions[values.status]}
          </p>
        </div>

        <ProductOrganizationFields categories={categories} categoryId={values.category_id} featured={values.featured}
          onCategory={(category_id) => setValues((current) => ({ ...current, category_id }))}
          onFeatured={(featured) => setValues((current) => ({ ...current, featured }))} />

        {state.error && showServerError && (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{state.error}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 border-t border-black/10 pt-6">
          <button type="submit" disabled={pending} className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C5B] disabled:cursor-wait disabled:opacity-60">
            {pending ? "Guardando cambios…" : "Guardar cambios"}
          </button>
          {!pending && <Link href="/admin" className="rounded-full px-4 py-3 text-sm font-semibold hover:bg-black/5">Cancelar</Link>}
        </div>
      </fieldset>
    </form>
  );
}

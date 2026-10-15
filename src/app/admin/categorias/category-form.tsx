"use client";

import { useActionState, useId } from "react";
import type { Category } from "@/lib/categories";
import { saveCategoryAction } from "./actions";

export default function CategoryForm({ category }: { category?: Category }) {
  const id = useId();
  const action = saveCategoryAction.bind(null, category?.id ?? null, category?.name ?? "");
  const [state, formAction, pending] = useActionState(action, { error: "", success: "" });
  return (
    <form action={formAction} aria-busy={pending} className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
      <fieldset disabled={pending}>
        <label htmlFor={id} className="text-sm font-semibold">{category ? "Nombre de la categoría" : "Nueva categoría"}</label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input id={id} name="name" required minLength={2} maxLength={60} defaultValue={category?.name ?? ""} placeholder="Por ejemplo: Casacas"
            className="min-w-0 flex-1 rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-[#B91C5B] focus:ring-2 focus:ring-pink-100" />
          <button type="submit" className="shrink-0 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-[#B91C5B] disabled:cursor-wait disabled:opacity-50">{pending ? "Guardando…" : category ? "Guardar nombre" : "Crear categoría"}</button>
        </div>
      </fieldset>
      {state.error && <p role="alert" className="mt-3 text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="mt-3 text-sm text-emerald-800">{state.success}</p>}
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import { createVariantAction, manageVariantAction } from "./actions";
import type { ProductVariant } from "@/lib/catalog-types";

function VariantRow({ productId, variant }: { productId: string; variant: ProductVariant }) {
  const action = manageVariantAction.bind(null, productId, variant.id);
  const [state, formAction, pending] = useActionState(action, { error: "", success: "" });
  return (
    <li className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-center gap-3">
        {variant.color_hex && (
          <span aria-hidden="true" className="h-8 w-8 shrink-0 rounded-full border border-black/20" style={{ backgroundColor: variant.color_hex }} />
        )}
        <div>
          <p className="font-bold">{variant.color} · {variant.size}</p>
          <p className={"mt-1 text-sm " + (variant.is_available ? "text-emerald-800" : "text-black/60")}>
            {variant.is_available ? "Disponible" : "Agotado"}
          </p>
        </div>
      </div>
      <form
        action={formAction}
        aria-busy={pending}
        onSubmit={(event) => {
          const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
          if (button?.value === "delete" && !window.confirm("¿Eliminar " + variant.color + " · " + variant.size + "?")) {
            event.preventDefault();
          }
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <input type="hidden" name="is_available" value={String(!variant.is_available)} />
        <button name="intent" value="availability" disabled={pending} className="rounded-full border border-black/15 px-4 py-2 text-xs font-semibold hover:bg-black/5 disabled:opacity-50">
          {pending ? "Guardando…" : variant.is_available ? "Marcar agotado" : "Marcar disponible"}
        </button>
        <button name="intent" value="delete" disabled={pending} className="rounded-full px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
          Eliminar
        </button>
        {state.error && <p role="alert" className="w-full text-sm text-red-700">{state.error}</p>}
        {!state.error && state.success && <p role="status" className="w-full text-sm text-emerald-800">{state.success}</p>}
      </form>
    </li>
  );
}

export default function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: ProductVariant[];
}) {
  const action = createVariantAction.bind(null, productId);
  const [state, formAction, pending] = useActionState(action, { error: "", success: "" });
  const [values, setValues] = useState({
    size: "",
    color: "",
    color_hex: "",
    is_available: "true",
  });
  const inputClass = "mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#EF2E7E] focus:ring-2 focus:ring-[#EF2E7E]/20";
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[360px_1fr]">
      <form action={formAction} aria-busy={pending} className="rounded-3xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-bold">Nueva combinación</h2>
        <p className="mt-2 text-sm text-black/60">Ejemplo: talla M y color Negro.</p>
        <fieldset disabled={pending} className="mt-6 space-y-5">
          <div>
            <label htmlFor="size" className="text-sm font-semibold">Talla</label>
            <input id="size" name="size" required maxLength={20} placeholder="S, M, L, 28, Única…" value={values.size} onChange={(e) => setValues({ ...values, size: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="color" className="text-sm font-semibold">Nombre del color</label>
            <input id="color" name="color" required maxLength={60} placeholder="Negro" value={values.color} onChange={(e) => setValues({ ...values, color: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="color_hex" className="text-sm font-semibold">Muestra de color · opcional</label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="color"
                aria-label="Elegir muestra de color"
                value={/^#[0-9a-f]{6}$/i.test(values.color_hex) ? values.color_hex : "#000000"}
                onChange={(e) => setValues({ ...values, color_hex: e.target.value })}
                className="h-12 w-14 shrink-0 cursor-pointer rounded-lg border border-black/15 bg-white p-1"
              />
              <input id="color_hex" name="color_hex" maxLength={7} pattern="#[0-9A-Fa-f]{6}" placeholder="#000000" value={values.color_hex} onChange={(e) => setValues({ ...values, color_hex: e.target.value })} className={inputClass + " !mt-0"} />
            </div>
            <p className="mt-2 text-xs text-black/60">Puedes dejarlo vacío para estampados o mezclas.</p>
          </div>
          <div>
            <label htmlFor="is_available" className="text-sm font-semibold">Disponibilidad</label>
            <select id="is_available" name="is_available" value={values.is_available} onChange={(e) => setValues({ ...values, is_available: e.target.value })} className={inputClass}>
              <option value="true">Disponible</option>
              <option value="false">Agotado</option>
            </select>
          </div>
          {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
          {!state.error && state.success && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{state.success} Cambia la talla o el color para agregar otra.</p>}
          <button type="submit" disabled={pending} className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C5B] disabled:opacity-50">
            {pending ? "Guardando…" : "Agregar variante"}
          </button>
        </fieldset>
      </form>

      <section aria-label="Variantes guardadas">
        <h2 className="mb-4 text-lg font-bold">Tallas y colores ({variants.length})</h2>
        {variants.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/20 p-10 text-center text-black/60">
            Agrega tu primera combinación de talla y color.
          </div>
        ) : (
          <ul className="space-y-3">
            {variants.map((variant) => <VariantRow key={variant.id} productId={productId} variant={variant} />)}
          </ul>
        )}
      </section>
    </div>
  );
}

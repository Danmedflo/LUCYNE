"use client";

import Link from "next/link";
import { useActionState, useState, type ChangeEvent } from "react";
import { createProductAction } from "./actions";

export default function ProductForm() {
  const [state, formAction, pending] = useActionState(
    createProductAction,
    { error: "" }
  );

  const [values, setValues] = useState({
    name: "",
    description: "",
    price: "",
    audience: "unisex",
    status: "draft",
  });

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 " +
    "text-base outline-none focus:border-[#EF2E7E] " +
    "focus:ring-2 focus:ring-[#EF2E7E]/20";

  return (
    <form
      action={formAction}
      aria-busy={pending}
      className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8"
    >
      <fieldset disabled={pending} className="space-y-6">
        <div>
          <label htmlFor="name" className="text-sm font-semibold">
            Nombre del producto
          </label>
          <input
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="Ejemplo: Polo oversize Essential"
            minLength={2}
            maxLength={120}
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-semibold">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleChange}
            placeholder="Describe la tela, el corte y los detalles de la prenda."
            rows={5}
            maxLength={3000}
            className={`${fieldClass} resize-y`}
          />
          <p className="mt-2 text-xs text-black/60">
            Opcional. Hasta 3000 caracteres.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="text-sm font-semibold">
              Precio en soles
            </label>
            <input
              id="price"
              name="price"
              type="text"
              inputMode="decimal"
              value={values.price}
              onChange={handleChange}
              placeholder="59.90"
              maxLength={9}
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="audience" className="text-sm font-semibold">
              Público
            </label>
            <select
              id="audience"
              name="audience"
              value={values.audience}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="unisex">Unisex</option>
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="status" className="text-sm font-semibold">
            Estado
          </label>
          <select
            id="status"
            name="status"
            value={values.status}
            onChange={handleChange}
            aria-describedby="status-help"
            className={fieldClass}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
          <p id="status-help" className="mt-2 text-sm text-black/60">
            {values.status === "draft"
              ? "Solo podrás verlo desde el administrador."
              : "Será visible para los visitantes del catálogo."}
          </p>
        </div>

        {state.error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 border-t border-black/10 pt-6">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C5B] disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Guardar producto"}
          </button>

          {!pending && (
            <Link
              href="/admin"
              className="rounded-full px-4 py-3 text-sm font-semibold hover:bg-black/5"
            >
              Cancelar
            </Link>
          )}
        </div>
      </fieldset>
    </form>
  );
}
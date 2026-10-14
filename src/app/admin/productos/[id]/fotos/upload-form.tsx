"use client";

import { useActionState, useState } from "react";
import { uploadProductImage } from "./actions";

export default function UploadForm({ productId }: { productId: string }) {
  const action = uploadProductImage.bind(null, productId);
  const [state, formAction, pending] = useActionState(action, {
    error: "",
    success: "",
  });
  const [clientError, setClientError] = useState("");
  const inputClass =
    "mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 " +
    "outline-none focus:border-[#EF2E7E] focus:ring-2 focus:ring-[#EF2E7E]/20";

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const file = new FormData(event.currentTarget).get("image");
        let message = "";
        if (!(file instanceof File) || file.size === 0) {
          message = "Selecciona una fotografía.";
        } else if (file.size > 5 * 1024 * 1024) {
          message = "La foto supera los 5 MB. Reduce su tamaño.";
        } else if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          message = "Usa una fotografía JPG, PNG o WebP.";
        }
        setClientError(message);
        if (message) event.preventDefault();
      }}
      aria-busy={pending}
      className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8"
    >
      <h2 className="text-xl font-bold">Subir fotografía</h2>
      <p className="mt-2 text-sm text-black/60">
        JPG, PNG o WebP · máximo 5 MB · una foto por subida.
      </p>

      <label htmlFor="image" className="mt-6 block text-sm font-semibold">
        Archivo
      </label>
      <input
        id="image"
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required
        disabled={pending}
        onChange={() => setClientError("")}
        className={inputClass + " file:mr-4 file:rounded-lg file:border-0 file:bg-black/5 file:px-3 file:py-2"}
      />

      <label htmlFor="alt_text" className="mt-5 block text-sm font-semibold">
        Descripción de la fotografía
      </label>
      <input
        id="alt_text"
        name="alt_text"
        placeholder="Ejemplo: Polo negro visto de frente"
        maxLength={200}
        disabled={pending}
        className={inputClass}
      />
      <p className="mt-2 text-xs text-black/60">
        Opcional. Ayuda a quienes usan lectores de pantalla.
      </p>

      {(clientError || state.error) && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {clientError || state.error}
        </p>
      )}
      {!clientError && !state.error && state.success && (
        <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C5B] disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Subiendo fotografía…" : "Subir fotografía"}
      </button>
    </form>
  );
}

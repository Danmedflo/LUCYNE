"use client";

import { useActionState } from "react";
import Image from "next/image";
import { manageProductPhoto } from "./manage-actions";

type Photo = { id: string; url: string; alt: string };
type PendingDeletion = { id: string; label: string };

export default function PhotoManager({
  productId, photos, pendingDeletions,
}: {
  productId: string;
  photos: Photo[];
  pendingDeletions: PendingDeletion[];
}) {
  const action = manageProductPhoto.bind(null, productId);
  const [state, formAction, pending] = useActionState(action, {
    error: "", success: "", warning: "",
  });

  return (
    <form
      action={formAction}
      aria-busy={pending}
      onSubmit={(event) => {
        const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        if (button?.value.startsWith("delete:") && !window.confirm(
          "¿Eliminar esta fotografía? Se retirará de la galería y se borrará su archivo. Para recuperarla tendrás que subirla otra vez."
        )) event.preventDefault();
      }}
    >
      <h2 className="mb-4 text-lg font-bold">Fotografías guardadas ({photos.length})</h2>
      {state.error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{state.success}</p>}
      {state.warning && <p role="alert" className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{state.warning}</p>}
      {pending && <p role="status" className="mb-4 text-sm text-black/60">Guardando cambios…</p>}

      <fieldset disabled={pending}>
        <legend className="sr-only">Administrar fotografías</legend>
        {photos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/20 bg-white/60 p-10 text-center text-black/60">
            Este producto todavía no tiene fotografías. Puedes subir una desde el formulario.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {photos.map((photo, index) => (
              <figure key={photo.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                <div className="relative aspect-[3/4] bg-white">
                  <Image src={photo.url} alt={photo.alt} fill unoptimized sizes="(max-width: 640px) 90vw, 320px" className="object-contain p-3" />
                  {index === 0 && <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-bold text-white">Portada</span>}
                </div>
                <figcaption className="border-t border-black/5 p-4">
                  <p className="break-words text-sm text-black/60">{photo.alt}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="submit"
                      name="operation"
                      value={"cover:" + photo.id}
                      disabled={pending || index === 0}
                      className="rounded-full border border-black/15 px-4 py-2 text-xs font-semibold hover:bg-black/5 disabled:cursor-default disabled:opacity-45"
                    >
                      {index === 0 ? "Portada actual" : "Usar como portada"}
                    </button>
                    <button type="submit" name="operation" value={"delete:" + photo.id} disabled={pending} className="rounded-full px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-45">
                      Eliminar
                    </button>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {pendingDeletions.length > 0 && (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-bold text-amber-950">Eliminaciones pendientes</h3>
            <p className="mt-2 text-sm text-amber-900">
              Estas fotos ya están retiradas de la galería. Reintenta para completar la eliminación del archivo.
            </p>
            <ul className="mt-4 space-y-3">
              {pendingDeletions.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/70 p-3">
                  <span className="break-words text-sm text-amber-950">{item.label || "Fotografía retirada"}</span>
                  <button type="submit" name="operation" value={"cleanup:" + item.id} disabled={pending} className="rounded-full border border-amber-900/20 px-4 py-2 text-xs font-bold text-amber-950 disabled:opacity-45">
                    Reintentar
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </fieldset>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleFavorite, useFavorites } from "@/lib/favorites-store";

export function FavoritesLink() {
  const { ids, ready } = useFavorites();
  return (
    <Link href="/favoritos" className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold hover:border-[#B91C5B] hover:text-[#B91C5B]">
      <Heart filled={false} />
      Favoritos{ready && ids.length > 0 ? " (" + ids.length + ")" : ""}
    </Link>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

export function FavoriteButton({ productId, name }: { productId: string; name: string }) {
  const { ids, ready, storageAvailable } = useFavorites();
  const [error, setError] = useState("");
  const saved = ids.includes(productId.toLowerCase());
  return (
    <div>
      <button
        type="button"
        disabled={!ready}
        aria-pressed={saved}
        aria-label={(saved ? "Quitar de favoritos: " : "Guardar en favoritos: ") + name}
        onClick={() => setError(toggleFavorite(productId) ?? "")}
        className={"inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 " + (saved ? "border-[#B91C5B]/25 bg-pink-50 text-[#B91C5B]" : "border-black/15 bg-white text-black/65 hover:border-[#B91C5B] hover:text-[#B91C5B]")}
      >
        <Heart filled={saved} />
        {saved ? "Guardado" : "Guardar"}
      </button>
      {error && <p role="alert" className="mt-2 text-xs leading-relaxed text-red-700">{error}</p>}
      {!storageAvailable && !error && <p className="mt-2 text-xs text-black/60">Activa el almacenamiento del navegador para guardar favoritos.</p>}
    </div>
  );
}

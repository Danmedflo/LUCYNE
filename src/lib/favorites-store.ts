"use client";

import { useMemo, useSyncExternalStore } from "react";

export const FAVORITES_KEY = "lucyne:favorites:v1";
export const FAVORITES_LIMIT = 100;
const CHANGED_EVENT = "lucyne:favorites-changed";
const UNAVAILABLE = "!storage-unavailable";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseFavorites(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id): id is string => typeof id === "string" && uuid.test(id)).map((id) => id.toLowerCase()))].slice(0, FAVORITES_LIMIT);
  } catch {
    return [];
  }
}

function snapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    // El snapshot es una cadena estable, no un objeto nuevo en cada render.
    return window.localStorage.getItem(FAVORITES_KEY) ?? "[]";
  } catch {
    return UNAVAILABLE;
  }
}
function serverSnapshot(): null { return null; }
function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === FAVORITES_KEY || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGED_EVENT, onChange);
  };
}

export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const ids = useMemo(() => parseFavorites(raw), [raw]);
  return { ids, ready: raw !== null, storageAvailable: raw !== UNAVAILABLE };
}

function writeFavorites(ids: string[]): string | null {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(CHANGED_EVENT));
    return null;
  } catch {
    return "No pudimos guardar el cambio en este navegador. Revisa sus permisos de almacenamiento.";
  }
}
export function toggleFavorite(productId: string): string | null {
  if (!uuid.test(productId)) return "No se pudo identificar esta prenda.";
  const raw = snapshot();
  if (raw === null || raw === UNAVAILABLE) return "El almacenamiento de favoritos no está disponible en este navegador.";
  const id = productId.toLowerCase();
  const ids = parseFavorites(raw);
  if (ids.includes(id)) return writeFavorites(ids.filter((item) => item !== id));
  if (ids.length >= FAVORITES_LIMIT) return "Puedes guardar hasta 100 prendas. Quita alguna para añadir otra.";
  return writeFavorites([id, ...ids]);
}
export function removeFavorites(productIds: string[]): string | null {
  const raw = snapshot();
  if (raw === null || raw === UNAVAILABLE) return "El almacenamiento de favoritos no está disponible en este navegador.";
  const removed = new Set(productIds.map((id) => id.toLowerCase()));
  return writeFavorites(parseFavorites(raw).filter((id) => !removed.has(id)));
}

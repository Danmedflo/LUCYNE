"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function HomeProductsRetry() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button type="button" disabled={pending} aria-busy={pending} onClick={() => startTransition(() => router.refresh())}
      className="mt-5 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-[#B91C5B] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B91C5B] disabled:cursor-wait disabled:opacity-60">
      {pending ? "Actualizando…" : "Reintentar"}
    </button>
  );
}

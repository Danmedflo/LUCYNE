"use client";

import Link from "next/link";
import StoreHeader from "@/components/store-header";
import StoreFooter from "@/components/store-footer";

export default function CatalogError({ retry }: { retry: () => void }) {
  return (
    <>
      <StoreHeader active="catalog" />
      <main id="lucyne-main" tabIndex={-1} className="flex min-h-[55vh] items-center justify-center bg-[#F2F2F2] px-5 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8 text-center sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B91C5B]">LUCYNE</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight">No pudimos cargar esta página.</h1>
          <p role="alert" className="mt-4 text-sm leading-relaxed text-black/60">Comprueba tu conexión e inténtalo nuevamente en unos momentos.</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => retry()} className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-[#B91C5B]">Reintentar</button>
            <Link href="/" className="rounded-full border border-black/15 px-6 py-3 text-sm font-semibold hover:bg-black/5">Ir al inicio</Link>
          </div>
        </div>
      </main>
      <StoreFooter />
    </>
  );
}

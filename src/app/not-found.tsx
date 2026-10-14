import Link from "next/link";
import StoreHeader from "@/components/store-header";
import StoreFooter from "@/components/store-footer";

export default function NotFound() {
  return (
    <>
      <StoreHeader />
      <main id="lucyne-main" tabIndex={-1} className="flex min-h-[55vh] items-center justify-center bg-[#F2F2F2] px-5 py-16 text-center">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B91C5B]">LUCYNE · 404</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Esta página no está disponible.</h1>
          <p className="mt-5 text-sm leading-relaxed text-black/60">El enlace puede haber cambiado o la prenda ya no está publicada.</p>
          <Link href="/catalogo" className="mt-7 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-[#B91C5B]">Explorar el catálogo</Link>
        </div>
      </main>
      <StoreFooter />
    </>
  );
}

import { Suspense } from "react";
import { loadCategories } from "@/lib/categories";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import ProductForm from "./product-form";

export const metadata = {
  title: "Agregar producto | LUCYNE",
  robots: {
    index: false,
    follow: false,
  },
};

async function NewProductContent() {
  const { supabase } = await requireAdmin();
  const categories = await loadCategories(supabase);

  return (
    <main className="min-h-screen bg-[#F2F2F2] px-5 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin"
          className="text-sm font-semibold text-black/60 hover:text-black"
        >
          ← Volver al administrador
        </Link>

        <header className="mb-8 mt-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B91C5B]">
            LUCYNE · Catálogo
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Agregar producto.
          </h1>

          <p className="mt-3 text-black/60">
            Completa los datos de tu nueva prenda.
          </p>
        </header>

        <ProductForm categories={categories} />
      </div>
    </main>
  );
}

export default function NewProductPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#F2F2F2] p-10"><p role="status">Cargando formulario…</p></main>}><NewProductContent /></Suspense>;
}

import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { loadCategories } from "@/lib/categories";
import CategoryForm from "./category-form";

export const metadata = { title: "Categorías | LUCYNE", robots: { index: false, follow: false } };

async function CategoriesContent() {
  const { supabase } = await requireAdmin();
  const categories = await loadCategories(supabase);
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="text-sm font-semibold text-black/60 hover:text-black">← Volver al administrador</Link>
      <header className="my-9">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B91C5B]">LUCYNE · Organización</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Categorías<span className="text-[#EF2E7E]">.</span></h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-black/60">Dale un lugar a cada prenda. Crea categorías y asígnalas al agregar o editar tus productos.</p>
      </header>
      <CategoryForm />
      <section aria-label="Categorías existentes" className="mt-10 space-y-4">
        <h2 className="text-lg font-bold">Tus categorías <span className="ml-2 text-sm font-normal text-black/50">({categories.length})</span></h2>
        <p className="text-sm leading-relaxed text-black/60">En el catálogo se mostrarán las categorías que tengan productos publicados. Al cambiar un nombre, sus productos conservan la categoría.</p>
        {categories.length ? categories.map((category) => <CategoryForm key={category.id} category={category} />)
          : <p className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-black/60">Empieza con tu primera categoría: polos, pantalones, vestidos…</p>}
      </section>
    </div>
  );
}

export default function CategoriesPage() {
  return <main className="min-h-screen bg-[#F2F2F2] px-5 py-10 text-black sm:py-14"><Suspense fallback={<p role="status">Cargando categorías…</p>}><CategoriesContent /></Suspense></main>;
}

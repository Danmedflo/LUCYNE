import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import EditForm from "./edit-form";

export const metadata = {
  title: "Editar producto | LUCYNE",
  robots: { index: false, follow: false },
};

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();

  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, description, price, audience, status, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("No se pudo cargar el producto.");
  if (!product) notFound();

  return (
    <main className="min-h-screen bg-[#F2F2F2] px-5 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin" className="text-sm font-semibold text-black/60 hover:text-black">← Volver al administrador</Link>
        <header className="my-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B91C5B]">LUCYNE · Catálogo</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Editar producto.</h1>
          <p className="mt-3 break-words text-black/60">{product.name}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={"/admin/productos/" + id + "/fotos"} className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5">Fotografías</Link>
            <Link href={"/admin/productos/" + id + "/variantes"} className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5">Tallas y colores</Link>
          </div>
        </header>
        <EditForm product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          audience: product.audience,
          status: product.status,
          updated_at: product.updated_at,
        }} />
      </div>
    </main>
  );
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F2F2F2] p-10"><p role="status">Cargando producto…</p></main>}>
      <EditContent params={params} />
    </Suspense>
  );
}

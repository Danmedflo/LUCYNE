import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { ProductVariant } from "@/lib/catalog-types";
import VariantManager from "./variant-manager";

export const metadata = {
  title: "Tallas y colores | LUCYNE",
  robots: { index: false, follow: false },
};

async function VariantContent({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, product_variants(id, size, color, color_hex, is_available)")
    .eq("id", id).maybeSingle();
  if (error) throw new Error("No se pudieron cargar las variantes.");
  if (!product) notFound();
  const variants = [...(product.product_variants as ProductVariant[])].sort(
    (a, b) => a.color.localeCompare(b.color, "es") || a.size.localeCompare(b.size, "es", { numeric: true })
  );

  return (
    <main className="min-h-screen bg-[#F2F2F2] px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-wrap gap-5 text-sm font-semibold">
          <Link href="/admin" className="text-black/60 hover:text-black">← Administrador</Link>
          <Link href={"/admin/productos/" + id + "/fotos"} className="text-[#B91C5B]">Ver fotografías</Link>
        </nav>
        <header className="my-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B91C5B]">LUCYNE · Tallas y colores</p>
          <h1 className="mt-3 break-words text-3xl font-black tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-3 max-w-2xl text-black/60">
            Cada variante es una combinación de talla y color. Puedes marcarla como agotada sin eliminarla.
          </p>
        </header>
        <VariantManager productId={id} variants={variants} />
      </div>
    </main>
  );
}

export default function VariantsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F2F2F2] p-10"><p role="status">Cargando tallas y colores…</p></main>}>
      <VariantContent params={params} />
    </Suspense>
  );
}

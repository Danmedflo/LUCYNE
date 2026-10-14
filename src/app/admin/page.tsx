import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logoutAction } from "@/app/login/actions";
import type { DashboardProduct } from "@/lib/admin-dashboard";
import Dashboard from "./dashboard";
import styles from "./dashboard.module.css";

export const metadata = {
  title: "Administración | LUCYNE",
  robots: { index: false, follow: false },
};

async function AdminContent() {
  // La sesión y el permiso se verifican antes de consultar cualquier producto.
  const { supabase, user } = await requireAdmin();
  const products: DashboardProduct[] = [];
  let offset = 0;
  let total: number | null = null;

  while (true) {
    const { data, error, count } = await supabase
      .from("products")
      .select("id, name, price, status, audience, created_at, product_images(id, storage_path, alt_text, sort_order, created_at), product_variants(id, is_available)", {
        count: offset === 0 ? "exact" : undefined,
      })
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(offset, offset + 199);

    if (error) {
      console.error("Error al cargar dashboard:", error.code);
      throw new Error("No se pudo cargar el panel de administración.");
    }
    if (offset === 0) total = count;
    const rows = data ?? [];
    for (const product of rows) {
      const photos = [...(product.product_images ?? [])].sort((a, b) =>
        a.sort_order - b.sort_order ||
        Date.parse(a.created_at) - Date.parse(b.created_at) ||
        a.id.localeCompare(b.id)
      );
      const variants = product.product_variants ?? [];
      const cover = photos[0];
      products.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        status: product.status,
        audience: product.audience,
        created_at: product.created_at,
        image_url: cover ? supabase.storage.from("product-images").getPublicUrl(cover.storage_path).data.publicUrl : null,
        image_alt: cover?.alt_text || product.name,
        photo_count: photos.length,
        variant_count: variants.length,
        available_count: variants.filter((variant) => variant.is_available).length,
      });
    }
    offset += rows.length;
    if (!rows.length || (total !== null && offset >= total) || (total === null && rows.length < 200)) break;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className={styles.enter + " flex flex-wrap items-start justify-between gap-6"}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B91C5B]">LUCYNE · Administración</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Tu catálogo<span className="text-[#EF2E7E]">.</span></h1>
          <p className="mt-3 text-sm text-black/60">Todo listo para darle vida a tu colección.</p>
          <p className="mt-2 break-all text-xs text-black/50">{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/productos/nuevo" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-[#B91C5B]">+ Agregar producto</Link>
          <Link href="/" className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold hover:bg-black/5">Ver tienda</Link>
          <form action={logoutAction}>
            <button type="submit" className="rounded-full px-4 py-3 text-sm font-semibold text-black/60 hover:bg-black/5">Cerrar sesión</button>
          </form>
        </div>
      </header>
      <Dashboard products={products} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#F2F2F2] px-4 py-8 text-black sm:px-8 sm:py-12">
      <Suspense fallback={<p role="status" className="mx-auto max-w-7xl rounded-3xl bg-white p-8 text-black/60">Cargando tu catálogo…</p>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}

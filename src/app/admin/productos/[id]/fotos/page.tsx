import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import UploadForm from "./upload-form";
import PhotoManager from "./photo-manager";

export const metadata = {
  title: "Fotografías | LUCYNE",
  robots: { index: false, follow: false },
};

type StoredPhoto = {
  id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
};

async function PhotosContent({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id: routeId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(routeId)) notFound();
  const id = routeId.toLowerCase();

  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, status, product_images(id, storage_path, alt_text, sort_order, created_at)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("No se pudieron cargar las fotografías.");
  if (!product) notFound();

  const { data: pendingDeletions, error: pendingError } = await supabase
    .from("product_image_deletions")
    .select("id, label")
    .eq("product_id", id)
    .order("created_at", { ascending: true });

  const photos = [...(product.product_images as StoredPhoto[])]
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))
    .map((image) => ({
      id: image.id,
      url: supabase.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl,
      alt: image.alt_text || product.name,
    }));

  return (
    <main className="min-h-screen bg-[#F2F2F2] px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-wrap gap-5 text-sm font-semibold">
          <Link href="/admin" className="text-black/60 hover:text-black">← Administrador</Link>
          <Link href={"/admin/productos/" + id + "/editar"} className="text-[#B91C5B]">Editar producto</Link>
          <Link href={"/admin/productos/" + id + "/variantes"} className="text-[#B91C5B]">Tallas y colores</Link>
        </nav>
        <header className="my-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B91C5B]">LUCYNE · Fotografías</p>
          <h1 className="mt-3 break-words text-3xl font-black tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-black/60">Elige la portada que aparecerá en el catálogo y administra las fotos de tu prenda.</p>
          {product.status !== "published" && (
            <p className="mt-3 text-sm font-medium text-[#B91C5B]">Este producto no está publicado en el catálogo.</p>
          )}
        </header>
        <div className="grid items-start gap-8 lg:grid-cols-[360px_1fr]">
          <UploadForm productId={id} />
          {pendingError ? (
            <div role="alert" className="rounded-2xl bg-amber-50 p-6 text-sm text-amber-900">
              No se pudo cargar la gestión de fotografías. Si acabas de instalar este paso, ejecuta el archivo 004_manage_product_images.sql en Supabase. Si ya lo ejecutaste, revisa la conexión y recarga.
            </div>
          ) : (
            <PhotoManager productId={id} photos={photos} pendingDeletions={pendingDeletions ?? []} />
          )}
        </div>
      </div>
    </main>
  );
}

export default function ProductPhotosPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F2F2F2] p-10"><p role="status">Cargando fotografías…</p></main>}>
      <PhotosContent params={params} />
    </Suspense>
  );
}

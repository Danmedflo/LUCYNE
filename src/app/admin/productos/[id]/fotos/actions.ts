"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";

type UploadState = {
  error: string;
  success: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadProductImage(
  productId: string,
  _previousState: UploadState,
  formData: FormData
): Promise<UploadState> {
  // La autorización se repite en la acción, aunque la página esté protegida.
  const { supabase } = await requireAdmin();
  const fail = (error: string): UploadState => ({ error, success: "" });

  if (!UUID.test(productId)) return fail("El producto no es válido.");

  const file = formData.get("image");
  const altText = String(formData.get("alt_text") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return fail("Selecciona una fotografía.");
  }
  if (file.size > MAX_BYTES) {
    return fail("La fotografía debe pesar como máximo 5 MB.");
  }
  if (altText.length > 200) {
    return fail("La descripción de la foto admite hasta 200 caracteres.");
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name")
    .eq("id", productId)
    .maybeSingle();

  if (productError) return fail("No se pudo consultar el producto.");
  if (!product) return fail("El producto ya no existe.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  let extension = "";
  let contentType = "";

  // Comprobamos la cabecera, además del tamaño. No se aceptan SVG ni HTML.
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    extension = "jpg";
    contentType = "image/jpeg";
  } else if (
    [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value)
  ) {
    extension = "png";
    contentType = "image/png";
  } else if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    extension = "webp";
    contentType = "image/webp";
  } else {
    return fail("Usa una fotografía JPG, PNG o WebP.");
  }

  const { data: lastImage, error: orderError } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (orderError) return fail("No se pudo consultar la galería.");

  const storagePath = productId + "/" + randomUUID() + "." + extension;
  const bucket = supabase.storage.from("product-images");
  const { error: uploadError } = await bucket.upload(storagePath, bytes, {
    contentType,
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) {
    console.error("Error de Storage:", uploadError.message);
    return fail(
      "No se pudo subir la foto. Comprueba la conexión y que ejecutaste el SQL 003."
    );
  }

  const { error: insertError } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: storagePath,
    alt_text: altText || product.name,
    sort_order: (lastImage?.[0]?.sort_order ?? -1) + 1,
  });

  if (insertError) {
    // Compensación: Storage y PostgreSQL no comparten una transacción.
    const { error: cleanupError } = await bucket.remove([storagePath]);
    console.error("Error al registrar fotografía:", insertError.code);
    if (cleanupError) {
      console.error("Archivo pendiente de limpieza en Storage:", storagePath);
      return fail(
        "No se pudo asociar la foto. Quedó un archivo sin asociar en Storage; revisa la terminal antes de volver a subirlo."
      );
    }
    return fail("No se pudo asociar la foto. Puedes volver a intentarlo.");
  }

  revalidatePath("/admin/productos/" + productId + "/fotos");
  revalidatePath("/admin");
  revalidatePath("/catalogo");
  revalidatePath("/");
  revalidatePath("/catalogo/" + productId);

  return { error: "", success: "Fotografía guardada correctamente." };
}

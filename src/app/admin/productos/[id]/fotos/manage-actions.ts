"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";

type PhotoState = { error: string; success: string; warning: string };
type SessionClient = Awaited<ReturnType<typeof requireAdmin>>["supabase"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = (error: string): PhotoState => ({ error, success: "", warning: "" });

function refreshPhotos(productId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/productos/" + productId + "/fotos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  revalidatePath("/catalogo/" + productId);
}

async function finishDeletion(supabase: SessionClient, productId: string, deletionId: string) {
  const { data: item, error } = await supabase
    .from("product_image_deletions")
    .select("id, storage_path")
    .eq("id", deletionId)
    .eq("product_id", productId)
    .maybeSingle();
  if (error) throw new Error("Cannot read pending deletion");
  if (!item) return;
  if (!item.storage_path.startsWith(productId + "/")) throw new Error("Invalid file path");

  // Nunca eliminar un archivo que vuelva a estar asociado a una foto activa.
  const { data: references, error: referencesError } = await supabase
    .from("product_images").select("id").eq("storage_path", item.storage_path).limit(1);
  if (referencesError || references?.length) throw new Error("File still referenced or reference check failed");

  const { error: storageError } = await supabase.storage
    .from("product-images").remove([item.storage_path]);
  if (storageError) throw new Error("Storage deletion failed");

  const { error: deleteError } = await supabase
    .from("product_image_deletions").delete().eq("id", item.id).eq("product_id", productId);
  if (deleteError) throw new Error("Cannot complete pending deletion");
}

export async function manageProductPhoto(
  productId: string,
  _previous: PhotoState,
  formData: FormData
): Promise<PhotoState> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(productId)) return fail("El producto no es válido.");
  productId = productId.toLowerCase();
  const parts = String(formData.get("operation") ?? "").split(":");
  const [operation, targetId] = parts;
  if (parts.length !== 2 || !UUID.test(targetId ?? "") || !["cover", "delete", "cleanup"].includes(operation)) {
    return fail("La operación no es válida.");
  }

  if (operation === "cover") {
    const { error } = await supabase.rpc("lucyne_set_product_cover", {
      p_product_id: productId,
      p_image_id: targetId,
    });
    if (error) {
      console.error("Error al cambiar portada:", error.code);
      return fail(error.code === "P0002"
        ? "La fotografía ya no pertenece a este producto. Recarga la página."
        : "No se pudo cambiar la portada. Comprueba que ejecutaste el SQL 004.");
    }
    refreshPhotos(productId);
    return { error: "", success: "Portada actualizada.", warning: "" };
  }

  let deletionId = targetId;
  if (operation === "delete") {
    const { data, error } = await supabase.rpc("lucyne_remove_product_image", {
      p_product_id: productId,
      p_image_id: targetId,
    });
    if (error || typeof data !== "string" || !UUID.test(data)) {
      console.error("Error al retirar fotografía:", error?.code);
      refreshPhotos(productId);
      return fail(error?.code === "P0002"
        ? "La fotografía ya fue eliminada o no pertenece a este producto."
        : "No se pudo retirar la fotografía. Comprueba que ejecutaste el SQL 004.");
    }
    deletionId = data;
  }

  try {
    await finishDeletion(supabase, productId, deletionId);
  } catch {
    refreshPhotos(productId);
    return {
      error: "",
      success: "",
      warning: "Queda una eliminación pendiente. Puedes completarla con Reintentar, incluso después de recargar la página.",
    };
  }

  refreshPhotos(productId);
  return {
    error: "",
    success: operation === "delete" ? "Fotografía eliminada." : "Eliminación completada.",
    warning: "",
  };
}

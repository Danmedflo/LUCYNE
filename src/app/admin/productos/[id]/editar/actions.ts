"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateProductCategory } from "@/lib/categories";
import { requireAdmin } from "@/lib/auth/require-admin";

type EditState = { error: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateProductAction(
  productId: string,
  previousVersion: string,
  _previousState: EditState,
  formData: FormData
): Promise<EditState> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(productId)) return { error: "El producto no es válido." };
  if (!previousVersion || previousVersion.length > 60 || !Number.isFinite(Date.parse(previousVersion))) {
    return { error: "Recarga la página antes de guardar." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim().replace(",", ".");
  const audience = String(formData.get("audience") ?? "");
  const status = String(formData.get("status") ?? "");
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const featured = formData.get("featured") === "on";

  if (name.length < 2 || name.length > 120) {
    return { error: "El nombre debe tener entre 2 y 120 caracteres." };
  }
  if (description.length > 3000) {
    return { error: "La descripción admite hasta 3000 caracteres." };
  }
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(price)) {
    return { error: "Ingresa un precio válido, como 59.90, con hasta dos decimales." };
  }
  if (!["mujer", "hombre", "unisex"].includes(audience)) {
    return { error: "Selecciona un público válido." };
  }
  if (!["draft", "published", "archived"].includes(status)) {
    return { error: "Selecciona un estado válido." };
  }

  try {
    const categoryError = await validateProductCategory(supabase, categoryId);
    if (categoryError) return { error: categoryError };
    const { data, error } = await supabase
      .from("products")
      .update({ name, description, price, audience, status, category_id: categoryId || null, featured })
      .eq("id", productId)
      .eq("updated_at", previousVersion)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Error al editar producto:", error.code);
      return { error: "No se pudo guardar el producto. Inténtalo nuevamente." };
    }
    if (!data) {
      return {
        error: "El producto fue modificado en otra ventana o ya no existe. Recarga la página para revisar los datos actuales antes de guardar.",
      };
    }
  } catch {
    return { error: "No se pudo conectar. Revisa tu conexión e inténtalo nuevamente." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/productos/" + productId + "/editar");
  revalidatePath("/admin/productos/" + productId + "/fotos");
  revalidatePath("/admin/productos/" + productId + "/variantes");
  revalidatePath("/catalogo");
  revalidatePath("/");
  revalidatePath("/catalogo/" + productId);
  redirect("/admin");
}

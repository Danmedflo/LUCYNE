"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { VariantActionState } from "@/lib/catalog-types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = (error: string): VariantActionState => ({ error, success: "" });

function refreshProduct(id: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/productos/" + id + "/variantes");
  revalidatePath("/catalogo");
  revalidatePath("/catalogo/" + id);
}

export async function createVariantAction(
  productId: string,
  _previous: VariantActionState,
  formData: FormData
): Promise<VariantActionState> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(productId)) return fail("El producto no es válido.");

  const size = String(formData.get("size") ?? "")
    .normalize("NFC").trim().replace(/\s+/g, " ").toLocaleUpperCase("es-PE");
  const rawColor = String(formData.get("color") ?? "")
    .normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("es-PE");
  const color = rawColor.charAt(0).toLocaleUpperCase("es-PE") + rawColor.slice(1);
  const colorHex = String(formData.get("color_hex") ?? "").trim();
  const available = String(formData.get("is_available") ?? "");

  if (!size || size.length > 20) return fail("La talla debe tener entre 1 y 20 caracteres.");
  if (!color || color.length > 60) return fail("El color debe tener entre 1 y 60 caracteres.");
  if (colorHex && !/^#[0-9a-f]{6}$/i.test(colorHex)) {
    return fail("El código de color debe tener el formato #000000 o quedar vacío.");
  }
  if (!["true", "false"].includes(available)) return fail("Selecciona una disponibilidad válida.");

  const { data: product, error: productError } = await supabase
    .from("products").select("id").eq("id", productId).maybeSingle();
  if (productError) return fail("No se pudo consultar el producto.");
  if (!product) return fail("El producto ya no existe.");

  const { error } = await supabase.from("product_variants").insert({
    product_id: productId,
    size,
    color,
    color_hex: colorHex ? colorHex.toUpperCase() : null,
    is_available: available === "true",
  });

  if (error) {
    if (error.code === "23505") return fail("Esta combinación de talla y color ya existe.");
    console.error("Error al crear variante:", error.code);
    return fail("No se pudo guardar la variante. Inténtalo nuevamente.");
  }

  refreshProduct(productId);
  return { error: "", success: "Variante guardada." };
}

export async function manageVariantAction(
  productId: string,
  variantId: string,
  _previous: VariantActionState,
  formData: FormData
): Promise<VariantActionState> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(productId) || !UUID.test(variantId)) return fail("La variante no es válida.");
  const intent = String(formData.get("intent") ?? "");
  if (!["availability", "delete"].includes(intent)) return fail("La operación no es válida.");

  if (intent === "availability") {
    const available = String(formData.get("is_available") ?? "");
    if (!["true", "false"].includes(available)) return fail("La disponibilidad no es válida.");
    const { data, error } = await supabase
      .from("product_variants")
      .update({ is_available: available === "true" })
      .eq("id", variantId)
      .eq("product_id", productId)
      .select("id")
      .maybeSingle();

    if (error) return fail("No se pudo actualizar la disponibilidad.");
    if (!data) return fail("La variante ya no existe en este producto. Recarga la página.");
    refreshProduct(productId);
    return { error: "", success: "Disponibilidad actualizada." };
  }

  const { data, error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId)
    .eq("product_id", productId)
    .select("id")
    .maybeSingle();

  if (error) return fail("No se pudo eliminar la variante.");
  if (!data) return fail("La variante ya no existe en este producto. Recarga la página.");
  refreshProduct(productId);
  return { error: "", success: "Variante eliminada." };
}

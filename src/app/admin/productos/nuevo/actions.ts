"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateProductCategory } from "@/lib/categories";
import { requireAdmin } from "@/lib/auth/require-admin";

type FormState = {
  error: string;
};

export async function createProductAction(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rawPrice = String(formData.get("price") ?? "")
    .trim()
    .replace(",", ".");
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

  if (!/^\d{1,6}(\.\d{1,2})?$/.test(rawPrice)) {
    return {
      error: "Ingresa un precio válido, como 59.90, con hasta dos decimales.",
    };
  }

  if (!["mujer", "hombre", "unisex"].includes(audience)) {
    return { error: "Selecciona para quién es el producto." };
  }

  if (!["draft", "published"].includes(status)) {
    return { error: "Selecciona un estado válido." };
  }

  const slugBase =
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "producto";

  try {
    const categoryError = await validateProductCategory(supabase, categoryId);
    if (categoryError) return { error: categoryError };
    const { error } = await supabase.from("products").insert({
      name,
      description,
      price: rawPrice,
      audience,
      status,
      category_id: categoryId || null,
      featured,
      slug: `${slugBase}-${randomUUID()}`,
    });

    if (error) {
      console.error("Error al crear producto:", error.code);

      return {
        error: "No se pudo guardar. Revisa tu conexión y tus permisos.",
      };
    }
  } catch {
    return {
      error: "No se pudo conectar con Supabase. Inténtalo nuevamente.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect("/admin");
}
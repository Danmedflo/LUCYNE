"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { CATEGORY_ID } from "@/lib/categories";

type CategoryState = { error: string; success: string };

export async function saveCategoryAction(id: string | null, previousName: string, _state: CategoryState, formData: FormData): Promise<CategoryState> {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (name.length < 2 || name.length > 60 || !slug) return { error: "Usa un nombre de 2 a 60 caracteres que incluya letras o números.", success: "" };
  if (id && (!CATEGORY_ID.test(id) || !previousName)) return { error: "Recarga la página antes de guardar.", success: "" };
  try {
    const query = id
      ? supabase.from("categories").update({ name, slug }).eq("id", id).eq("name", previousName)
      : supabase.from("categories").insert({ name, slug });
    const { data, error } = await query.select("id").maybeSingle();
    if (error) return { error: error.code === "23505" ? "Ya existe una categoría con ese nombre o uno equivalente." : "No se pudo guardar la categoría. Inténtalo nuevamente.", success: "" };
    if (!data) return { error: "La categoría cambió en otra ventana o ya no existe. Recarga antes de editar.", success: "" };
  } catch {
    return { error: "No se pudo conectar. Revisa tu conexión.", success: "" };
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos/nuevo");
  revalidatePath("/admin/productos/[id]/editar", "page");
  revalidatePath("/admin");
  revalidatePath("/catalogo");
  return { error: "", success: id ? "Categoría actualizada." : "Categoría creada. Ya puedes asignarla a tus productos." };
}

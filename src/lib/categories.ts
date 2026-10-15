import type { SupabaseClient } from "@supabase/supabase-js";

export type Category = { id: string; name: string; slug: string };
export const CATEGORY_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function loadCategories(supabase: SupabaseClient): Promise<Category[]> {
  const categories: Category[] = [];
  for (let offset = 0; ; offset += 200) {
    const { data, error } = await supabase.from("categories").select("id, name, slug")
      .order("name").order("id").range(offset, offset + 199);
    if (error) throw new Error("No se pudieron cargar las categorías. Inténtalo nuevamente.");
    categories.push(...(data ?? []));
    if (!data || data.length < 200) return categories;
  }
}

export async function validateProductCategory(supabase: SupabaseClient, categoryId: string) {
  if (!categoryId) return null;
  if (!CATEGORY_ID.test(categoryId)) return "Selecciona una categoría válida.";
  const { data, error } = await supabase.from("categories").select("id").eq("id", categoryId).maybeSingle();
  if (error) return "No se pudo comprobar la categoría. Inténtalo nuevamente.";
  return data ? null : "La categoría ya no existe. Recarga la página y selecciona otra.";
}

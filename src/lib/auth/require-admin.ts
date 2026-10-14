import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createSessionClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    throw new Error("No se pudieron verificar los permisos.");
  }

  if (!admin) {
    redirect("/login");
  }

  return { supabase, user };
}
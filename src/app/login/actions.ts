"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

type LoginState = {
  error: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  try {
    const supabase = await createSessionClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        error: "No se pudo iniciar sesión. Revisa tus credenciales.",
      };
    }

    const { data: admin, error: permissionError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (permissionError || !admin) {
      await supabase.auth.signOut({ scope: "local" });

      return {
        error: permissionError
          ? "No se pudieron comprobar los permisos. Inténtalo nuevamente."
          : "Esta cuenta no tiene acceso al administrador.",
      };
    }
  } catch {
    return {
      error: "No se pudo conectar. Inténtalo nuevamente.",
    };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createSessionClient();

  const { error } = await supabase.auth.signOut({
    scope: "local",
  });

  if (error) {
    throw new Error("No se pudo cerrar la sesión. Inténtalo nuevamente.");
  }

  redirect("/login");
}
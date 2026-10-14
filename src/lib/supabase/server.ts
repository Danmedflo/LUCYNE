import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSessionClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Falta configurar Supabase en .env.local.");
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },

      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Durante el render del servidor no se pueden escribir
          // cookies. El proxy se encarga de renovar la sesión.
        }
      },
    },
  });
}
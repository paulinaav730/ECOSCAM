import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function isSupabaseServerConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      anonKey &&
      url.startsWith("https://") &&
      !url.includes("tu-proyecto.supabase.co") &&
      anonKey !== "tu_anon_key_publica_aqui"
  );
}

export async function createSupabaseServerClient() {
  if (!isSupabaseServerConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Record<string, unknown>)
            );
          } catch {
            // Ignored when called from a Server Component render
          }
        },
      },
    }
  );
}

export async function getAuthenticatedUserWithRole() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { user: null, role: null, isConfigured: false };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, role: null, isConfigured: true };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, alias, preferred_municipality")
    .eq("id", user.id)
    .single();

  return {
    user,
    role: (profile?.role as "user" | "admin") ?? "user",
    profile,
    isConfigured: true,
  };
}

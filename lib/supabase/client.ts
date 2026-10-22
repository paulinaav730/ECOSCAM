import { createBrowserClient } from "@supabase/ssr";

export function isSupabaseClientConfigured(): boolean {
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

export function createSupabaseBrowserClient() {
  if (!isSupabaseClientConfigured()) {
    return null;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

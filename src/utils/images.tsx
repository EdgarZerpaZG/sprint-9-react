import { supabase } from "../lib/supabaseClient";

export function getPublicImageUrl(path: string): string {
  if (!path) return "/default.jpg";

  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return data?.publicUrl ?? "/default.jpg";
}
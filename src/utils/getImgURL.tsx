import { supabase } from "../lib/supabaseClient";

export function getImageUrl(folder: string, filename: string): string {
  const { data } = supabase.storage
    .from("images")
    .getPublicUrl(`${folder}/${filename}`);

  return data?.publicUrl ?? "/default.jpg";
}
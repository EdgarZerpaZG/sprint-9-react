import { supabase } from "../lib/supabaseClient";

export async function uploadCoverImage(
  file: File,
  type: "pages" | "posts",
  slug: string
) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${type}/${slug}.${ext}`;

  const { error } = await supabase.storage
    .from("images")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  return path;
}
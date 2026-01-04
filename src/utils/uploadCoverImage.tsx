import { supabase } from "../lib/supabaseClient";

export async function uploadCoverImage(
  file: File,
  type: "pages" | "posts",
  slug: string
) {
  const safeSlug = slug.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `covers/${type}/${safeSlug}.${ext}`;

  const { error } = await supabase.storage
    .from("images")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  return path;
}
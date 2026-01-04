import { supabase } from "../lib/supabaseClient";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const MAX_IMAGE_SIZE = MAX_FILE_SIZE;

export async function uploadImageToSupabase(
  file: File,
  folder: string = "home"
): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File is too large. Max size is 2MB.");
  }

  const ext = file.name.split(".").pop() || "bin";
  const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("[uploadImageToSupabase] error:", error);
    throw error;
  }

  return data.path;
}
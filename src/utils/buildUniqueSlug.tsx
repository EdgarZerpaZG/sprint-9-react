import { supabase } from "../lib/supabaseClient";
import { Slugify } from "./slugify";

export async function buildUniqueSlug(table: "pages" | "posts", title: string) {
  const base = Slugify(title);
  let slug = base;
  let i = 1;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return slug;

    slug = `${base}-${i++}`;
  }
}
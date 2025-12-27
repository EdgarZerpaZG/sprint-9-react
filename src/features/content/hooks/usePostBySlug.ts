import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { PostRow } from "../../../types/contentTypes";
import { useUserRole } from "../../../hooks/useUserRole";

export function usePostBySlug(slug: string | undefined) {
  const [post, setPost] = useState<PostRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { role, loadingRole } = useUserRole();

  useEffect(() => {
    if (!slug) return;
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      const isPrivileged = role === "editor" || role === "admin";

      let query = supabase.from("posts").select("*").eq("slug", slug);

      if (!isPrivileged) {
        query = query.eq("status", "published");
      }

      const { data, error } = await query.maybeSingle();

      if (!alive) return;

      if (error) {
        setError(error.message);
        setPost(null);
      } else {
        setPost((data as PostRow) ?? null);
      }

      setLoading(false);
    }

    if (!loadingRole) {
      load();
    }

    return () => {
      alive = false;
    };
  }, [slug, role, loadingRole]);

  return { post, loading, error };
}
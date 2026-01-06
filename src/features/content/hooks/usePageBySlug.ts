import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { PageRow } from "../../../types/contentTypes";
import { useUserRole } from "../../../hooks/useUserRole";

export function usePageBySlug(slug: string | undefined) {
  const [page, setPage] = useState<PageRow | null>(null);
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

      let query = supabase.from("pages").select("*").eq("slug", slug);

      if (!isPrivileged) {
        query = query.eq("status", "published");
      }

      const { data, error } = await query.maybeSingle();

      if (!alive) return;

      if (error) {
        setError(error.message);
        setPage(null);
      } else {
        setPage((data as PageRow) ?? null);
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

  return { page, loading, error };
}
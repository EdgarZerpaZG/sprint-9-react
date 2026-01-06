import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { PageRow } from "../../../types/contentTypes";

type UsePublicPagesOptions = {
  page?: number;
  pageSize?: number;
};

export function usePublicPages({ page = 1, pageSize = 10 }: UsePublicPagesOptions) {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await supabase
        .from("pages")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!alive) return;

      if (error) {
        console.error("[usePublicPages] error:", error);
        setError(error.message);
      } else {
        setPages((data ?? []) as PageRow[]);
        setTotal(count ?? 0);
      }

      setLoading(false);
    }

    load();

    return () => {
      alive = false;
    };
  }, [page, pageSize]);

  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

  return {
    pages,
    total,
    totalPages,
    loading,
    error,
  };
}
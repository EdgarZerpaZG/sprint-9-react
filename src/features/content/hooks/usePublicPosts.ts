import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { PostRow } from "../../../types/contentTypes";

type UsePublicPostsOptions = {
  page?: number;
  pageSize?: number;
};

export function usePublicPosts({ page = 1, pageSize = 10 }: UsePublicPostsOptions) {
  const [posts, setPosts] = useState<PostRow[]>([]);
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
        .from("posts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!alive) return;

      if (error) {
        console.error("[usePublicPosts] error:", error);
        setError(error.message);
      } else {
        setPosts((data ?? []) as PostRow[]);
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
    posts,
    total,
    totalPages,
    loading,
    error,
  };
}
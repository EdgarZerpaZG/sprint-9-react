import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { PageRow } from "../../../types/contentTypes";

export function usePages() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) setError(error);
    setPages((data ?? []) as PageRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return { pages, loading, error, refetch: fetchPages };
}
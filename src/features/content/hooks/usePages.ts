import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type {
  PageRow,
  ContentStatus,
  PageType,
} from "../../../types/contentTypes";

type UsePagesOptions = {
  status?: ContentStatus | "all";
  type?: PageType | "all";
  parentCollectionId?: string | null;
};

export function usePages(options: UsePagesOptions = {}) {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const { status = "all", type = "all", parentCollectionId } = options;

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase.from("pages").select("*");

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (type !== "all") {
      query = query.eq("type", type);
    }

    if ("parentCollectionId" in options) {
      if (parentCollectionId === null) {
        query = query.is("parent_collection_id", null);
      } else if (typeof parentCollectionId === "string") {
        query = query.eq("parent_collection_id", parentCollectionId);
      }
    }

    query = query.order("updated_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      setError(error);
      setPages([]);
    } else {
      setPages((data ?? []) as PageRow[]);
    }

    setLoading(false);
  }, [status, type, parentCollectionId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return { pages, loading, error, refetch: fetchPages };
}
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { PageRow } from "../types/contentTypes";

export function useNavPages() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .in("type", ["home", "main", "collection"])
        .eq("status", "published")
        .order("type", { ascending: true })
        .order("title", { ascending: true });

      if (!alive) return;

      if (error) {
        console.error("[useNavPages] error:", error);
        setPages([]);
      } else {
        setPages((data ?? []) as PageRow[]);
      }

      setLoading(false);
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const home = pages.find((p) => p.type === "home") || null;
  const mains = pages.filter((p) => p.type === "main");
  const collections = pages.filter((p) => p.type === "collection");

  return {
    loading,
    pages,
    home,
    mains,
    collections,
  };
}
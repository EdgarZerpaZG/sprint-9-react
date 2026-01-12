import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import type { PageRow, PageType } from "../types/contentTypes";

type CollectionNode = PageRow & {
  children: PageRow[];
};

export type PagesNavTree = {
  home: PageRow | null;
  footer: PageRow | null;
  collections: CollectionNode[];
  mains: PageRow[];
  articles: PageRow[];
};

export function usePagesNavTree() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("title", { ascending: true });

      if (!alive) return;

      if (error) {
        console.error("[usePagesNavTree] load error:", error);
        setError(error.message);
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

  const tree: PagesNavTree = useMemo(() => {
    const byType = <T extends PageType>(type: T) =>
      pages.filter((p) => p.type === type);

    const home = byType("home")[0] ?? null;
    const footer = byType("footer")[0] ?? null;
    const mains = byType("main");
    const articles = byType("article");
    const collectionsRaw = byType("collection");
    const contents = byType("content");

    const collections: CollectionNode[] = collectionsRaw.map((col) => ({
      ...col,
      children: contents.filter(
        (c) => c.parent_collection_id === col.id
      ),
    }));

    return {
      home,
      footer,
      collections,
      mains,
      articles,
    };
  }, [pages]);

  return {
    tree,
    loading,
    error,
  };
}
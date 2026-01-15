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
  contents: PageRow[];
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

    const channel = supabase
      .channel("pages-nav-tree")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pages",
        },
        () => {
          if (!alive) return;
          load();
        }
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const tree: PagesNavTree = useMemo(() => {
    const byType = <T extends PageType>(type: T) =>
      pages.filter((p) => p.type === type);

    const home = byType("home")[0] ?? null;
    const footer = byType("footer")[0] ?? null;
    const mains = byType("main");
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
      contents,
    };
  }, [pages]);

  return {
    tree,
    loading,
    error,
  };
}
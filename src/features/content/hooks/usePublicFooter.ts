import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { Block } from "../../../types/contentTypes";

type FooterRow = {
  blocks: Block[] | null;
};

export function usePublicFooter() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("pages")
        .select("blocks")
        .eq("type", "footer")
        .eq("status", "published")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle<FooterRow>();

      if (!alive) return;

      if (error) {
        console.error("[usePublicFooter] load error:", error);
        setError(error.message);
        setBlocks([]);
      } else if (data) {
        setBlocks((data.blocks ?? []) as Block[]);
      } else {
        setBlocks([]);
      }

      setLoading(false);
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  return { blocks, loading, error };
}
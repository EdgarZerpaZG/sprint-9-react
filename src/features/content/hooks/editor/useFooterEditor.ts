import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { addBlockToList } from "../../utils/blocks";
import type {
  Block,
  ContentStatus,
  PageRow,
} from "../../../../types/contentTypes";

type FooterRow = PageRow;

export function useFooterEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pageId, setPageId] = useState<string | null>(null);
  const [status, setStatus] = useState<ContentStatus>("draft");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [title, setTitle] = useState("Footer");
  const [excerpt, setExcerpt] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("type", "footer")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle<FooterRow>();

      if (!alive) return;

      if (error && error.code !== "PGRST116") {
        console.error("[useFooterEditor] load error:", error);
        setError(error.message);
      } else if (data) {
        setPageId(data.id);
        setStatus(data.status);
        setBlocks((data.blocks ?? []) as Block[]);
        setUpdatedAt(data.updated_at);
        setTitle(data.title);
        setExcerpt(data.excerpt ?? "");
      } else {
        setPageId(null);
        setStatus("draft");
        setBlocks([]);
        setUpdatedAt(null);
        setTitle("Footer");
        setExcerpt("");
      }

      setLoading(false);
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  function addColumnsBlock() {
    setBlocks((prev) => addBlockToList("columns", prev));
  }

  function updateBlock(id: string, updater: (b: Block) => Block) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? updater(b) : b)));
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function reorderBlocks(next: Block[]) {
    setBlocks(next);
  }

  async function save() {
    setSaving(true);
    setError(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      const uid = session?.user?.id;
      if (!uid) throw new Error("No active session.");

      const payload = {
        author_id: uid,
        title: title || "Footer",
        slug: "footer",
        excerpt: excerpt || null,
        status,
        type: "footer" as const,
        parent_collection_id: null,
        blocks,
        cover_image_path: null,
      };

      if (!pageId) {
        const { data, error } = await supabase
          .from("pages")
          .insert([payload])
          .select("*")
          .single<FooterRow>();

        if (error) throw error;

        if (data) {
          setPageId(data.id);
          setUpdatedAt(data.updated_at);
        }
      } else {
        const { data, error } = await supabase
          .from("pages")
          .update(payload)
          .eq("id", pageId)
          .select("*")
          .single<FooterRow>();

        if (error) throw error;

        if (data) {
          setUpdatedAt(data.updated_at);
        }
      }
    } catch (e: any) {
      console.error("[useFooterEditor] save error:", e);
      setError(e.message ?? "Error saving footer.");
    } finally {
      setSaving(false);
    }
  }

  return {
    loading,
    saving,
    error,

    status,
    setStatus,

    title,
    setTitle,
    excerpt,
    setExcerpt,

    blocks,
    addColumnsBlock,
    updateBlock,
    removeBlock,
    reorderBlocks,

    updatedAt,
    save,
  };
}
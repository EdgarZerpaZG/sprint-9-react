import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import type { Block } from "../../../../types/contentTypes";

type ContentStatus = "draft" | "published";

type HomeRow = {
  id: string;
  status: ContentStatus;
  blocks: Block[];
  updated_at: string;
  last_editor_id: string | null;
};

export function useHomeEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rowId, setRowId] = useState<string | null>(null);
  const [status, setStatus] = useState<ContentStatus>("published");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("home_content")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle<HomeRow>();

      if (!alive) return;

      if (error) {
        console.error("[useHomeEditor] load error:", error);
        setError(error.message);
      } else if (data) {
        setRowId(data.id);
        setStatus(data.status);
        setBlocks((data.blocks ?? []) as Block[]);
        setUpdatedAt(data.updated_at);
      } else {
        setRowId(null);
        setStatus("draft");
        setBlocks([]);
        setUpdatedAt(null);
      }

      setLoading(false);
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  function addBlock(type: Block["type"]) {
    if (type === "hero") {
      setBlocks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "hero",
          data: {
            title: "Welcome to our shelter",
            subtitle: "You can edit this hero block from the dashboard.",
            buttonLabel: "See our animals",
            buttonUrl: "/pages/adopt",
            align: "left",
            backgroundImagePath: null,
          },
        },
      ]);
      return;
    }

    if (type === "columns") {
      setBlocks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "columns",
          data: {
            columns: [
              {
                id: crypto.randomUUID(),
                blocks: [],
              },
              {
                id: crypto.randomUUID(),
                blocks: [],
              },
            ],
          },
        } as Block,
      ]);
      return;
    }

    if (type === "heading") {
      setBlocks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "heading",
          data: { text: "", level: 2 },
        },
      ]);
      return;
    }

    if (type === "paragraph") {
      setBlocks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "paragraph",
          data: { text: "" },
        },
      ]);
      return;
    }

    if (type === "image") {
      setBlocks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "image",
          data: { path: "", alt: "" },
        },
      ]);
      return;
    }
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
      console.log("[useHomeEditor] saving...", {
        rowId,
        status,
        blocksCount: blocks.length,
      });

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("[useHomeEditor] session error:", sessionError);
        throw sessionError;
      }

      const uid = session?.user?.id ?? null;
      console.log("[useHomeEditor] current user id:", uid);

      // INSERT
      if (!rowId) {
        console.log("[useHomeEditor] inserting new home_content row");

        const { data, error } = await supabase
          .from("home_content")
          .insert([
            {
              status,
              blocks,
              last_editor_id: uid,
            },
          ])
          .select("*")
          .single<HomeRow>();

        console.log("[useHomeEditor] insert result:", { data, error });

        if (error) throw error;

        if (data) {
          setRowId(data.id);
          setUpdatedAt(data.updated_at);
        }
      } else {
        // UPDATE
        console.log(
          "[useHomeEditor] updating existing home_content row",
          rowId
        );

        const { data, error } = await supabase
          .from("home_content")
          .update({
            status,
            blocks,
            last_editor_id: uid,
          })
          .eq("id", rowId)
          .select("*")
          .single<HomeRow>();

        console.log("[useHomeEditor] update result:", { data, error });

        if (error) throw error;

        if (data) {
          setUpdatedAt(data.updated_at);
        }
      }
    } catch (e: any) {
      console.error("[useHomeEditor] save error (catch):", e);
      setError(e.message ?? "Error saving home content.");
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
    blocks,
    addBlock,
    updateBlock,
    removeBlock,
    reorderBlocks,
    save,
    updatedAt,
  };
}
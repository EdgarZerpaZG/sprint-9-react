import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { Slugify } from "../../../../utils/slugify";
import type { Block, PageRow, ContentStatus } from "../../../../types/contentTypes";

const emptyBlocks: Block[] = [];

function makeId() {
  return crypto.randomUUID();
}

export function usePageEditor(pageId?: string) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<ContentStatus>("draft");
  const [blocks, setBlocks] = useState<Block[]>(emptyBlocks);
  const [coverPath, setCoverPath] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      if (!pageId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", pageId)
        .maybeSingle();

      if (!alive) return;

      if (error) {
        setError(error.message);
      } else if (data) {
        const page = data as PageRow;
        setTitle(page.title);
        setSlug(page.slug);
        setExcerpt(page.excerpt ?? "");
        setStatus(page.status);
        setBlocks(page.blocks ?? []);
        setCoverPath(page.cover_image_path ?? null);
      }

      setLoading(false);
    }

    load();

    return () => {
      alive = false;
    };
  }, [pageId]);

  const computedSlug = useMemo(() => Slugify(title), [title]);

  useEffect(() => {
    if (!pageId) {
      setSlug(computedSlug);
    }
  }, [computedSlug, pageId]);

  function addBlock(type: Block["type"]) {
    if (type === "heading") {
      setBlocks((prev) => [
        ...prev,
        { id: makeId(), type: "heading", data: { text: "", level: 2 } },
      ]);
    }
    if (type === "paragraph") {
      setBlocks((prev) => [
        ...prev,
        { id: makeId(), type: "paragraph", data: { text: "" } },
      ]);
    }
    if (type === "image") {
      setBlocks((prev) => [
        ...prev,
        { id: makeId(), type: "image", data: { path: "", alt: "" } },
      ]);
    }
  }

  function updateBlock(id: string, updater: (b: Block) => Block) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? updater(b) : b)));
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function moveBlock(id: string, direction: "up" | "down") {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      if (i < 0) return prev;

      const j = direction === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= prev.length) return prev;

      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  async function save() {
    setSaving(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const uid = session?.user?.id;
      if (!uid) throw new Error("No active session.");

      const payload = {
        author_id: uid,
        title,
        slug,
        excerpt: excerpt || null,
        status,
        blocks,
        cover_image_path: coverPath,
      };

      // Create
      if (!pageId) {
        const { error } = await supabase.from("pages").insert([payload]);
        if (error) throw error;
        return;
      }

      // Update
      const { error } = await supabase
        .from("pages")
        .update(payload)
        .eq("id", pageId);

      if (error) throw error;
    } catch (e: any) {
      setError(e.message ?? "Error saving page.");
    } finally {
      setSaving(false);
    }
  }

  function reorderBlocks(next: Block[]) {
    setBlocks(next);
  }


  return {
    loading,
    saving,
    error,

    title,
    setTitle,
    slug,
    setSlug,
    excerpt,
    setExcerpt,
    status,
    setStatus,
    blocks,
    coverPath,
    setCoverPath,

    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,

    save,
    reorderBlocks,
  };
}
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { Slugify } from "../../../../utils/slugify";
import type {
  Block,
  ContentStatus,
  PostRow, // 👈 asegúrate de tener este tipo definido
} from "../../../../types/contentTypes";

const emptyBlocks: Block[] = [];

function makeId() {
  return crypto.randomUUID();
}

export function usePostEditor(postId?: string) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<ContentStatus>("draft");
  const [blocks, setBlocks] = useState<Block[]>(emptyBlocks);
  const [coverPath, setCoverPath] = useState<string | null>(null);

  // Load existing post if editing
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      if (!postId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .maybeSingle();

      if (!alive) return;

      if (error) {
        setError(error.message);
      } else if (data) {
        const post = data as PostRow;
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt ?? "");
        setStatus(post.status);
        setBlocks(post.blocks ?? []);
        setCoverPath(post.cover_image_path ?? null);
      }

      setLoading(false);
    }

    load();

    return () => {
      alive = false;
    };
  }, [postId]);

  // Auto slug from title (only for new posts)
  const computedSlug = useMemo(() => Slugify(title), [title]);

  useEffect(() => {
    if (!postId) {
      setSlug(computedSlug);
    }
  }, [computedSlug, postId]);

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

  function reorderBlocks(next: Block[]) {
    setBlocks(next);
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

      if (!postId) {
        // Insert
        const { error } = await supabase.from("posts").insert([payload]);
        if (error) throw error;
        return;
      }

      // Update
      const { error } = await supabase
        .from("posts")
        .update(payload)
        .eq("id", postId);

      if (error) throw error;
    } catch (e: any) {
      setError(e.message ?? "Error saving post.");
    } finally {
      setSaving(false);
    }
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
    reorderBlocks,
    save,
  };
}
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { Slugify } from "../../../../utils/slugify";
import type {
  Block,
  PageRow,
  ContentStatus,
  PageType,
} from "../../../../types/contentTypes";
import { addBlockToList } from "../../utils/blocks";

const emptyBlocks: Block[] = [];

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

  const [type, setType] = useState<PageType>("main");
  const [parentCollectionId, setParentCollectionId] = useState<string | null>(
    null
  );

  const [showTitle, setShowTitle] = useState<boolean>(true);

  const computedSlug = useMemo(() => Slugify(title), [title]);

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

        setType(page.type ?? "main");
        setParentCollectionId(page.parent_collection_id ?? null);
        setShowTitle((page as any).show_title ?? true);
      }

      setLoading(false);
    }

    load();

    return () => {
      alive = false;
    };
  }, [pageId]);

  useEffect(() => {
    if (!pageId && type !== "footer") {
      setSlug(computedSlug);
    }
  }, [computedSlug, pageId, type]);

  useEffect(() => {
    if (!pageId && type === "footer") {
      setBlocks((prev) => prev.filter((b) => b.type === "columns"));
    }
  }, [type, pageId]);

  function addBlock(blockType: Block["type"]) {
    setBlocks((prev) => addBlockToList(blockType, prev));
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
      if (type === "content" && !parentCollectionId) {
        throw new Error(
          "Content pages must belong to a collection. Please select a collection first."
        );
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const uid = session?.user?.id;
      if (!uid) throw new Error("No active session.");

      const rawSlug = slug?.trim();
      let effectiveSlug = rawSlug;

      if (!effectiveSlug) {
        if (type === "home") {
          effectiveSlug = "home";
        } else if (type === "footer") {
          effectiveSlug = "footer";
        } else {
          effectiveSlug = computedSlug || "";
        }
      }

      if (
        !effectiveSlug ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(effectiveSlug)
      ) {
        throw new Error(
          "Slug is required and must be lowercase, with letters, numbers and hyphens only."
        );
      }

      const payload = {
        author_id: uid,
        title,
        slug: effectiveSlug,
        excerpt: excerpt || null,
        status,
        type,
        parent_collection_id: type === "content" ? parentCollectionId : null,
        blocks,
        cover_image_path: coverPath,
        show_title: showTitle,
      };

      if (!pageId) {
        const { error } = await supabase.from("pages").insert([payload]);
        if (error) throw error;
        return;
      }

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

    type,
    setType,
    parentCollectionId,
    setParentCollectionId,

    showTitle,
    setShowTitle,

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
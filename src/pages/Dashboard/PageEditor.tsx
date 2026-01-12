import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useUserRole } from "../../hooks/useUserRole";
import { usePageEditor } from "../../features/content/hooks/editor/usePageEditor";
import { usePages } from "../../features/content/hooks/usePages";
import type { PageType } from "../../types/contentTypes";
import BlocksEditorDnd from "../../components/editor/BlocksEditorDnd";
import { resolvePublicPath } from "../../utils/resolvePublicPath";
import { ExternalLink } from "lucide-react";

export default function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const { role } = useUserRole();
  const isAdmin = role === "admin";

  const {
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
    addBlock,
    updateBlock,
    removeBlock,
    reorderBlocks,
    save,
  } = usePageEditor(isNew ? undefined : id);

  const { pages: allPages } = usePages();
  const collections = allPages.filter((p) => p.type === "collection");

  const isContentType = type === "content";
  const isFooterType = type === "footer";
  const noCollections = collections.length === 0;

  const cannotSaveContent =
    isContentType && (noCollections || !parentCollectionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save();
  };

  const getUrlPreview = () => {
    const s = slug || "<slug>";
    if (type === "home") return "/";
    return `/pages/${s}`;
  };

  const countByType = (t: string) =>
    blocks.filter((b) => b.type === t).length;

  const heroCount = countByType("hero");
  const columnsCount = countByType("columns");
  const headingCount = countByType("heading");
  const paragraphCount = countByType("paragraph");
  const imageCount = countByType("image");

  async function handleDelete() {
    if (isNew || !id) return;
    if (!isAdmin) return;

    const sure = window.confirm(
      "Are you sure you want to delete this page? This action cannot be undone."
    );
    if (!sure) return;

    try {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
      navigate("/dashboard/pages-management");
    } catch (e: any) {
      console.error("[PageEditor] delete error:", e);
      alert(e.message ?? "Error deleting page.");
    }
  }

  const publicUrl =
    !isNew && slug
      ? resolvePublicPath({
          ...( {} as any ),
          type,
          slug,
        } as any)
      : null;

  function handleOpenPublic() {
    if (!publicUrl) return;
    window.open(publicUrl, "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading page...</p>
      </div>
    );
  }

  const blockButtonBase =
    "px-2 py-1 text-xs rounded border border-slate-700 transition-colors";

  const makeBlockButtonClass = (active: boolean) =>
    active
      ? `${blockButtonBase} bg-emerald-600 text-white hover:bg-emerald-500`
      : `${blockButtonBase} bg-slate-800 text-slate-100 hover:bg-slate-700`;

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {isNew ? "New Page" : "Edit Page"}
          </h1>
          <p className="text-sm text-slate-400">
            Manage content blocks and SEO for this page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {publicUrl && (
            <button
              type="button"
              onClick={handleOpenPublic}
              className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm font-medium"
            >
              Open page <ExternalLink className="inline-block mr-2" size={16} />
            </button>
          )}

          {!isNew && isAdmin && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
            >
              Delete
            </button>
          )}

          <button
            type="button"
            onClick={save}
            disabled={saving || cannotSaveContent}
            className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving..." : "Save page"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded bg-red-500/10 border border-red-500/40 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
        {/* MAIN COLUMN */}
        <section className="col-span-12 lg:col-span-8 space-y-4 order-1 lg:order-0">
          <div className="space-y-3 rounded-lg bg-slate-900/60 border border-slate-800 p-4">
            {/* Page type */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Page type
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as PageType;
                  setType(newType);

                  if (newType !== "content") {
                    setParentCollectionId(null);
                  }

                  if (newType === "home") {
                    setSlug((prev) => prev || "home");
                  }

                  if (newType === "footer") {
                    setSlug("footer");
                  }
                }}
                className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
              >
                <option value="home">Home (unique)</option>
                <option value="main">Main</option>
                <option value="collection">Collection</option>
                <option value="content">Content (inside collection)</option>
                <option value="footer">Footer (unique)</option>
              </select>

              {isContentType && noCollections && (
                <p className="mt-1 text-xs text-amber-400">
                  There are no collections yet. Create a collection page first
                  before adding content pages.
                </p>
              )}
            </div>

            {/* Collection selector if type === content */}
            {isContentType && !noCollections && (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Collection
                </label>
                <select
                  value={parentCollectionId ?? ""}
                  onChange={(e) =>
                    setParentCollectionId(
                      e.target.value ? e.target.value : null
                    )
                  }
                  className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
                >
                  <option value="">Select a collection...</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Content pages must belong to a collection.
                </p>
              </div>
            )}

            {/* Title + checkbox mostrar/ocultar */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Page title"
              />
              <label className="mt-2 inline-flex items-center gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={showTitle}
                  onChange={(e) => setShowTitle(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950"
                />
                Show this title on the public page
              </label>
            </div>

            {/* Slug / URL */}
            {!isFooterType && (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="page-slug"
                />
                <p className="mt-1 text-xs text-slate-500">
                  URL: {getUrlPreview()}
                </p>
              </div>
            )}

            {isFooterType && (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  URL
                </label>
                <p className="text-xs text-slate-500">
                  The footer is global and rendered at the bottom of all public
                  pages. Internal anchor: <code>#footer</code>. Public URL:{" "}
                  <code>/pages/footer</code>
                </p>
              </div>
            )}

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={
                  isFooterType
                    ? "Optional internal notes about this footer."
                    : "Short summary used in listings and SEO."
                }
              />
            </div>
          </div>

          {/* Blocks toolbar */}
          <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-widest text-slate-500">
              Blocks
            </span>

            {isFooterType ? (
              <>
                <button
                  type="button"
                  onClick={() => addBlock("columns")}
                  className={makeBlockButtonClass(columnsCount > 0)}
                >
                  + Columns ({columnsCount})
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => addBlock("hero")}
                  className={makeBlockButtonClass(heroCount > 0)}
                >
                  + Hero ({heroCount})
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("columns")}
                  className={makeBlockButtonClass(columnsCount > 0)}
                >
                  + Columns ({columnsCount})
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("heading")}
                  className={makeBlockButtonClass(headingCount > 0)}
                >
                  + Heading ({headingCount})
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("paragraph")}
                  className={makeBlockButtonClass(paragraphCount > 0)}
                >
                  + Paragraph ({paragraphCount})
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("image")}
                  className={makeBlockButtonClass(imageCount > 0)}
                >
                  + Image ({imageCount})
                </button>
              </>
            )}
          </div>

          {/* Blocks editor with dnd-kit */}
          <BlocksEditorDnd
            blocks={blocks}
            onReorder={reorderBlocks}
            onRemove={removeBlock}
            onUpdate={updateBlock}
          />
        </section>

        {/* SIDEBAR */}
        <aside className="col-span-12 lg:col-span-4 space-y-4 lg:order-1 order-0">
          <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-4 space-y-3">
            <h2 className="text-sm font-semibold">Publish</h2>

            <div className="space-y-1 text-xs text-slate-400">
              <p>
                Status{" "}
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "draft" | "published")
                  }
                  className="ml-1 rounded bg-slate-950 border border-slate-800 px-2 py-1 text-xs"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </p>
            </div>

            {cannotSaveContent && (
              <p className="text-xs text-red-400">
                You must create a collection and assign it before saving this
                content page.
              </p>
            )}

            <div className="pt-2 flex justify-between gap-2">
              <button
                type="button"
                onClick={save}
                disabled={saving || cannotSaveContent}
                className="flex-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium disabled:opacity-50"
              >
                Save draft
              </button>
              <button
                type="submit"
                disabled={saving || cannotSaveContent}
                className="flex-1 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save & stay"}
              </button>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
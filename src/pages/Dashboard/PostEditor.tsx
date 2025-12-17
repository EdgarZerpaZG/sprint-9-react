import { useParams } from "react-router-dom";
import { usePostEditor } from "../../features/content/hooks/editor/usePostEditor";
import BlocksEditorDnd from "../../components/editor/BlocksEditorDnd";

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";

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
    blocks,
    addBlock,
    updateBlock,
    removeBlock,
    reorderBlocks,
    save,
  } = usePostEditor(isNew ? undefined : id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save();
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading post...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {isNew ? "New Post" : "Edit Post"}
          </h1>
          <p className="text-sm text-slate-400">
            Manage content blocks and SEO for this post.
          </p>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? "Saving..." : "Save post"}
        </button>
      </header>

      {error && (
        <div className="rounded bg-red-500/10 border border-red-500/40 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
        {/* MAIN COLUMN */}
        <section className="col-span-12 lg:col-span-8 space-y-4">
          {/* Title & slug */}
          <div className="space-y-3 rounded-lg bg-slate-900/60 border border-slate-800 p-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Post title"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="post-slug"
              />
              <p className="mt-1 text-xs text-slate-500">
                URL: /news/{slug || "<slug>"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Short summary used in listings and SEO."
              />
            </div>
          </div>

          {/* Blocks toolbar */}
          <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3 flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-500">
              Blocks
            </span>
            <button
              type="button"
              onClick={() => addBlock("heading")}
              className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700"
            >
              + Heading
            </button>
            <button
              type="button"
              onClick={() => addBlock("paragraph")}
              className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700"
            >
              + Paragraph
            </button>
            <button
              type="button"
              onClick={() => addBlock("image")}
              className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700"
            >
              + Image
            </button>
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
        <aside className="col-span-12 lg:col-span-4 space-y-4">
          <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-4 space-y-3">
            <h2 className="text-sm font-semibold">Publish</h2>

            <div className="space-y-1 text-xs text-slate-400">
              <p>
                Status:{" "}
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

            <div className="pt-2 flex justify-between gap-2">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="flex-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium disabled:opacity-50"
              >
                Save draft
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save & stay"}
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-4 space-y-3">
            <h2 className="text-sm font-semibold">SEO</h2>
            <p className="text-xs text-slate-500">
              Later we will add meta title, description and preview.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
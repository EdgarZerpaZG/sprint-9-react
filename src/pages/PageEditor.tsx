import { useParams } from "react-router-dom";
import { usePageEditor } from "../features/content/hooks/editor/usePageEditor";

export default function PageEditor() {
  const { id } = useParams();
  const isNew = id === "new" || !id;

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
    moveBlock,

    save,
    reorderBlocks,
  } = usePageEditor(isNew ? undefined : id);

  if (loading) return <p>Loading editor...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {isNew ? "Add New Page" : "Edit Page"}
        </h1>

        <button
          onClick={save}
          disabled={saving}
          className="px-3 py-2 rounded bg-emerald-500 text-white text-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-slate-900 border border-slate-800 rounded p-3"
          />

          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Slug"
            className="w-full bg-slate-900 border border-slate-800 rounded p-3 text-sm"
          />

          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Excerpt"
            className="w-full bg-slate-900 border border-slate-800 rounded p-3 text-sm min-h-24"
          />

          {/* Block toolbar */}
          <div className="flex gap-2">
            <button
              onClick={() => addBlock("heading")}
              className="px-2 py-1 rounded bg-slate-800 text-xs"
            >
              Add Heading
            </button>
            <button
              onClick={() => addBlock("paragraph")}
              className="px-2 py-1 rounded bg-slate-800 text-xs"
            >
              Add Paragraph
            </button>
            <button
              onClick={() => addBlock("image")}
              className="px-2 py-1 rounded bg-slate-800 text-xs"
            >
              Add Image
            </button>
          </div>

          {/* Blocks list (manual order) */}
          <div className="space-y-3">
            {blocks.map((b, index) => (
              <div
                key={b.id}
                className="p-3 rounded border border-slate-800 bg-slate-900/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">
                    {index + 1}. {b.type}
                  </span>

                  <div className="flex gap-1">
                    <button
                      onClick={() => moveBlock(b.id, "up")}
                      className="px-2 py-1 text-xs bg-slate-800 rounded"
                    >
                      Up
                    </button>
                    <button
                      onClick={() => moveBlock(b.id, "down")}
                      className="px-2 py-1 text-xs bg-slate-800 rounded"
                    >
                      Down
                    </button>
                    <button
                      onClick={() => removeBlock(b.id)}
                      className="px-2 py-1 text-xs bg-red-500/20 text-red-200 rounded"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Simple block editors */}
                {b.type === "heading" && (
                  <input
                    value={b.data.text}
                    onChange={(e) =>
                      updateBlock(b.id, (old) => ({
                        ...old,
                        type: "heading",
                        data: { ...old.data, text: e.target.value },
                      }))
                    }
                    placeholder="Heading text..."
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm"
                  />
                )}

                {b.type === "paragraph" && (
                  <textarea
                    value={b.data.text}
                    onChange={(e) =>
                      updateBlock(b.id, (old) => ({
                        ...old,
                        type: "paragraph",
                        data: { ...old.data, text: e.target.value },
                      }))
                    }
                    placeholder="Paragraph..."
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm min-h-20"
                  />
                )}

                {b.type === "image" && (
                  <input
                    value={b.data.path}
                    onChange={(e) =>
                      updateBlock(b.id, (old) => ({
                        ...old,
                        type: "image",
                        data: { ...old.data, path: e.target.value },
                      }))
                    }
                    placeholder="Image path..."
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar settings (WP vibe) */}
        <div className="space-y-4">
          <div className="p-4 rounded border border-slate-800 bg-slate-900/40">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">
              Publish
            </p>

            <label className="text-sm text-slate-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded p-2 text-sm"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>

            <button
              onClick={save}
              disabled={saving}
              className="w-full mt-3 px-3 py-2 rounded bg-emerald-500 text-white text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import BlocksEditorDnd from "../../components/editor/BlocksEditorDnd";
import { useHomeEditor } from "../../features/content/hooks/editor/useHomeEditor";

export default function HomeEditor() {
  const {
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
  } = useHomeEditor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save();
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading home content...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Home content</h1>
          <p className="text-sm text-slate-400">
            Design the public home using blocks (hero, headings, text, images, columns).
          </p>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? "Saving..." : "Save home"}
        </button>
      </header>

      {error && (
        <div className="rounded bg-red-500/10 border border-red-500/40 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8 space-y-4">
          {/* Block toolbar */}
          <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-500">
              Blocks
            </span>

            {/* HERO */}
            <button
              type="button"
              onClick={() => addBlock("hero")}
              className="px-2 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500"
            >
              + Hero
            </button>

            {/* COLUMNS */}
            <button
              type="button"
              onClick={() => addBlock("columns")}
              className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700"
            >
              + Columns
            </button>

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

          <BlocksEditorDnd
            blocks={blocks}
            onReorder={reorderBlocks}
            onRemove={removeBlock}
            onUpdate={updateBlock}
          />
        </section>

        <aside className="col-span-12 lg:col-span-4 space-y-4">
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

              {updatedAt && (
                <p>Last updated: {new Date(updatedAt).toLocaleString()}</p>
              )}
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
        </aside>
      </form>
    </div>
  );
}
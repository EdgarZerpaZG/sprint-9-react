import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "../../types/contentTypes";
import RichTextBlockEditor from "./RichTextBlockEditor";
import ImageBlockEditor from "./ImageBlockEditor";

type Props = {
  block: Block;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updater: (b: Block) => Block) => void;
};

export default function SortableBlockItem({
  block,
  index,
  onRemove,
  onUpdate,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  // ---------- Helpers "columns" ----------

  function ensureColumnsArray(
    b: Extract<Block, { type: "columns" }>
  ): { id: string; blocks: Block[] }[] {
    const raw = (b.data as any).columns;
    if (Array.isArray(raw)) return raw as { id: string; blocks: Block[] }[];
    return [];
  }

  function handleAddColumn() {
    onUpdate(block.id, (old) => {
      if (old.type !== "columns") return old;

      const cols = ensureColumnsArray(old);

      if (cols.length >= 4) {
        return old;
      }

      const newCol = {
        id: crypto.randomUUID(),
        blocks: [] as Block[],
      };

      return {
        ...old,
        data: {
          ...(old.data as any),
          columns: [...cols, newCol],
        },
      };
    });
  }

  function handleRemoveColumn(colId: string) {
    onUpdate(block.id, (old) => {
      if (old.type !== "columns") return old;
      const cols = ensureColumnsArray(old).filter((c) => c.id !== colId);
      return {
        ...old,
        data: {
          ...(old.data as any),
          columns: cols,
        },
      };
    });
  }

  function handleAddInnerBlock(
    colId: string,
    type: "title" | "paragraph" | "image"
  ) {
    onUpdate(block.id, (old) => {
      if (old.type !== "columns") return old;
      const cols = ensureColumnsArray(old).map((col) => {
        if (col.id !== colId) return col;

        const newBlockId = crypto.randomUUID();
        let newBlock: Block;

        if (type === "title") {
          newBlock = {
            id: newBlockId,
            type: "title",
            data: { text: "", level: 2, align: "left" },
          };
        } else if (type === "paragraph") {
          newBlock = {
            id: newBlockId,
            type: "paragraph",
            data: { text: "", align: "left" },
          };
        } else {
          newBlock = {
            id: newBlockId,
            type: "image",
            data: { path: "", alt: "" },
          };
        }

        return {
          ...col,
          blocks: [...col.blocks, newBlock],
        };
      });

      return {
        ...old,
        data: {
          ...(old.data as any),
          columns: cols,
        },
      };
    });
  }

  function handleUpdateInnerBlock(
    colId: string,
    innerId: string,
    updater: (b: Block) => Block
  ) {
    onUpdate(block.id, (old) => {
      if (old.type !== "columns") return old;
      const cols = ensureColumnsArray(old).map((col) => {
        if (col.id !== colId) return col;

        return {
          ...col,
          blocks: col.blocks.map((b) =>
            b.id === innerId ? updater(b) : b
          ),
        };
      });

      return {
        ...old,
        data: {
          ...(old.data as any),
          columns: cols,
        },
      };
    });
  }

  function handleRemoveInnerBlock(colId: string, innerId: string) {
    onUpdate(block.id, (old) => {
      if (old.type !== "columns") return old;
      const cols = ensureColumnsArray(old).map((col) => {
        if (col.id !== colId) return col;

        return {
          ...col,
          blocks: col.blocks.filter((b) => b.id !== innerId),
        };
      });

      return {
        ...old,
        data: {
          ...(old.data as any),
          columns: cols,
        },
      };
    });
  }

  function renderInnerBlockEditor(inner: Block, colId: string) {
    return (
      <div
        key={inner.id}
        className="border border-slate-800 bg-slate-950 rounded p-2 space-y-2"
      >
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{inner.type}</span>
          <button
            type="button"
            onClick={() => handleRemoveInnerBlock(colId, inner.id)}
            className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-200"
          >
            Remove
          </button>
        </div>

        {inner.type === "title" && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* H1–H6 */}
              <div className="flex items-center gap-1">
                <label className="text-[11px] text-slate-400">Level</label>
                <select
                  value={inner.data.level ?? 2}
                  onChange={(e) =>
                    handleUpdateInnerBlock(colId, inner.id, (old) => {
                      if (old.type !== "title") return old;
                      return {
                        ...old,
                        data: {
                          ...old.data,
                          level: Number(e.target.value) as
                            | 1
                            | 2
                            | 3
                            | 4
                            | 5
                            | 6,
                        },
                      };
                    })
                  }
                  className="rounded bg-slate-950 border border-slate-800 px-2 py-1 text-[11px]"
                >
                  {[1, 2, 3, 4, 5, 6].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      H{lvl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Align */}
              <div className="flex items-center gap-1">
                <label className="text-[11px] text-slate-400">Align</label>
                <select
                  value={inner.data.align ?? "left"}
                  onChange={(e) =>
                    handleUpdateInnerBlock(colId, inner.id, (old) => {
                      if (old.type !== "title") return old;
                      return {
                        ...old,
                        data: {
                          ...old.data,
                          align: e.target.value as
                            | "left"
                            | "center"
                            | "right",
                        },
                      };
                    })
                  }
                  className="rounded bg-slate-950 border border-slate-800 px-2 py-1 text-[11px]"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            <input
              type="text"
              value={inner.data.text}
              onChange={(e) =>
                handleUpdateInnerBlock(colId, inner.id, (old) => {
                  if (old.type !== "title") return old;
                  return {
                    ...old,
                    data: { ...old.data, text: e.target.value },
                  };
                })
              }
              placeholder="Title text..."
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm"
            />
          </div>
        )}

        {inner.type === "paragraph" && (
          
          <RichTextBlockEditor
            value={inner.data.text}
            onChange={(newText) =>
              handleUpdateInnerBlock(colId, inner.id, (old) => {
                if (old.type !== "paragraph") return old;
                return {
                  ...old,
                  data: { ...old.data, text: newText },
                };
              })
            }
          />
        )}

        {inner.type === "image" && (
          <ImageBlockEditor
            path={inner.data.path}
            alt={inner.data.alt}
            folder="home-columns"
            onChange={({ path, alt }) =>
              handleUpdateInnerBlock(colId, inner.id, (old) => {
                if (old.type !== "image") return old;
                return {
                  ...old,
                  data: {
                    ...old.data,
                    path,
                    alt,
                  },
                };
              })
            }
          />
        )}
      </div>
    );
  }


  const innerButtonBase =
    "px-2 py-0.5 text-[11px] rounded border border-slate-700 transition-colors";

  const makeInnerButtonClass = (active: boolean) =>
    active
      ? `${innerButtonBase} bg-emerald-600 text-white hover:bg-emerald-500`
      : `${innerButtonBase} bg-slate-800 text-slate-100 hover:bg-slate-700`;

  // ---------- RENDER PRINCIPAL ----------

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 rounded border border-slate-800 bg-slate-900/50"
    >
      {/* Header: drag handle + type + remove */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 text-xs bg-slate-800 rounded cursor-grab"
            {...attributes}
            {...listeners}
            title="Drag"
          >
            Drag
          </button>

          <span className="text-xs text-slate-400">
            {index + 1}. {block.type}
          </span>
        </div>

        <button
          onClick={() => onRemove(block.id)}
          className="px-2 py-1 text-xs bg-red-500/20 text-red-200 rounded"
        >
          Remove
        </button>
      </div>

      {/* Simple Block: TITLE */}
      {block.type === "title" && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            {/* H1–H6 */}
            <div className="flex items-center gap-1">
              <label className="text-xs text-slate-400">Level</label>
              <select
                value={block.data.level ?? 2}
                onChange={(e) =>
                  onUpdate(block.id, (old) => {
                    if (old.type !== "title") return old;
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        level: Number(e.target.value) as
                          | 1
                          | 2
                          | 3
                          | 4
                          | 5
                          | 6,
                      },
                    };
                  })
                }
                className="rounded bg-slate-950 border border-slate-800 px-2 py-1 text-xs"
              >
                {[1, 2, 3, 4, 5, 6].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    H{lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-1">
              <label className="text-xs text-slate-400">Align</label>
              <select
                value={block.data.align ?? "left"}
                onChange={(e) =>
                  onUpdate(block.id, (old) => {
                    if (old.type !== "title") return old;
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        align: e.target.value as "left" | "center" | "right",
                      },
                    };
                  })
                }
                className="rounded bg-slate-950 border border-slate-800 px-2 py-1 text-xs"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          <input
            value={block.data.text}
            onChange={(e) =>
              onUpdate(block.id, (old) => {
                if (old.type === "title") {
                  return {
                    ...old,
                    data: { ...old.data, text: e.target.value },
                  };
                }
                return old;
              })
            }
            placeholder="Title text..."
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm"
          />
        </div>
      )}

      {block.type === "paragraph" && (
        <RichTextBlockEditor
          value={block.data.text}
          onChange={(newText) =>
            onUpdate(block.id, (old) => ({
              ...old,
              type: "paragraph",
              data: { ...old.data, text: newText },
            }))
          }
        />
      )}

      {block.type === "image" && (
        <ImageBlockEditor
          path={block.data.path}
          alt={block.data.alt}
          folder="home"
          onChange={({ path, alt }) =>
            onUpdate(block.id, (old) => {
              if (old.type !== "image") return old;
              return {
                ...old,
                data: {
                  ...old.data,
                  path,
                  alt,
                },
              };
            })
          }
        />
      )}

      {/* HERO block */}
      {block.type === "hero" && (
        <div className="space-y-3 mt-2">
          {/* Title */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Hero title
            </label>
            <input
              type="text"
              value={block.data.title}
              onChange={(e) =>
                onUpdate(block.id, (old) => {
                  if (old.type !== "hero") return old;
                  return {
                    ...old,
                    data: {
                      ...old.data,
                      title: e.target.value,
                    },
                  };
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm"
              placeholder="Main hero title..."
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Subtitle
            </label>
            <textarea
              value={block.data.subtitle ?? ""}
              onChange={(e) =>
                onUpdate(block.id, (old) => {
                  if (old.type !== "hero") return old;
                  return {
                    ...old,
                    data: {
                      ...old.data,
                      subtitle: e.target.value,
                    },
                  };
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm min-h-16"
              placeholder="Short supporting text..."
            />
          </div>

          {/* Button text + URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Button label
              </label>
              <input
                type="text"
                value={block.data.buttonLabel ?? ""}
                onChange={(e) =>
                  onUpdate(block.id, (old) => {
                    if (old.type !== "hero") return old;
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        buttonLabel: e.target.value,
                      },
                    };
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs"
                placeholder="Example: View adoptable pets"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Button URL
              </label>
              <input
                type="text"
                value={block.data.buttonUrl ?? ""}
                onChange={(e) =>
                  onUpdate(block.id, (old) => {
                    if (old.type !== "hero") return old;
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        buttonUrl: e.target.value,
                      },
                    };
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs"
                placeholder="/adopt"
              />
            </div>
          </div>

          {/* Alignment */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Content alignment
            </label>
            <select
              value={block.data.align ?? "left"}
              onChange={(e) =>
                onUpdate(block.id, (old) => {
                  if (old.type !== "hero") return old;
                  return {
                    ...old,
                    data: {
                      ...old.data,
                      align: e.target.value as "left" | "center" | "right",
                    },
                  };
                })
              }
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          {/* Background image */}
          <div className="pt-2 border-t border-slate-800 mt-2">
            <p className="text-xs text-slate-400 mb-2">
              Background image (optional)
            </p>
            <ImageBlockEditor
              path={block.data.backgroundImagePath ?? ""}
              alt={block.data.title}
              folder="home-hero"
              onChange={({ path }) =>
                onUpdate(block.id, (old) => {
                  if (old.type !== "hero") return old;
                  return {
                    ...old,
                    data: {
                      ...old.data,
                      backgroundImagePath: path,
                    },
                  };
                })
              }
            />
          </div>
        </div>
      )}

      {/* Columns block */}
      {block.type === "columns" && (
        <div className="space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Columns block (hasta 4 columnas, sin drag interno de momento)
            </p>

            {ensureColumnsArray(block as any).length < 4 && (
              <button
                type="button"
                onClick={handleAddColumn}
                className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700"
              >
                + Add column
              </button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {ensureColumnsArray(block as any).map((col, colIndex) => {
              const titleCount = col.blocks.filter(
                (b) => b.type === "title"
              ).length;
              const paragraphCount = col.blocks.filter(
                (b) => b.type === "paragraph"
              ).length;
              const imageCount = col.blocks.filter(
                (b) => b.type === "image"
              ).length;

              return (
                <div
                  key={col.id}
                  className="border border-slate-800 rounded p-2 bg-slate-950/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Column {colIndex + 1}
                    </span>
                    {ensureColumnsArray(block as any).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveColumn(col.id)}
                        className="px-1.5 py-0.5 text-[11px] rounded bg-red-500/20 text-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => handleAddInnerBlock(col.id, "title")}
                      className={makeInnerButtonClass(titleCount > 0)}
                    >
                      + Title ({titleCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddInnerBlock(col.id, "paragraph")}
                      className={makeInnerButtonClass(paragraphCount > 0)}
                    >
                      + Paragraph ({paragraphCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddInnerBlock(col.id, "image")}
                      className={makeInnerButtonClass(imageCount > 0)}
                    >
                      + Image ({imageCount})
                    </button>
                  </div>

                  <div className="space-y-2">
                    {col.blocks.length === 0 && (
                      <p className="text-xs text-slate-500">
                        No blocks in this column yet.
                      </p>
                    )}

                    {col.blocks.map((inner) =>
                      renderInnerBlockEditor(inner, col.id)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
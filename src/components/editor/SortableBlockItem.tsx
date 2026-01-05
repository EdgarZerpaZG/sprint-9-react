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

      {/* Block editors */}
      {block.type === "heading" && (
        <input
          value={block.data.text}
          onChange={(e) =>
            onUpdate(block.id, (old) => {
              if (old.type === "heading") {
                return {
                  ...old,
                  data: { ...old.data, text: e.target.value },
                };
              }
              return old;
            })
          }
          placeholder="Heading text..."
          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm"
        />
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

          {/* Background image (optional) */}
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
    </div>
  );
}
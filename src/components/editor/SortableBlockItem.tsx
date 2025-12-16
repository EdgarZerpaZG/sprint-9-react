import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "../../types/contentTypes";

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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
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
              if (old.type !== "heading") return old;
              return {
                ...old,
                type: "heading",
                data: { ...old.data, text: e.target.value },
              };
            })
          }
          placeholder="Heading text..."
          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm"
        />
      )}

      {block.type === "paragraph" && (
        <textarea
          value={block.data.text}
          onChange={(e) =>
            onUpdate(block.id, (old) => ({
              ...old,
              type: "paragraph",
              data: { ...old.data, text: e.target.value },
            }))
          }
          placeholder="Paragraph..."
          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm min-h-20"
        />
      )}

      {block.type === "image" && (
        <input
          value={block.data.path}
          onChange={(e) =>
            onUpdate(block.id, (old) => ({
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
  );
}
import {DndContext, closestCenter, type DragEndEvent} from "@dnd-kit/core";
import {SortableContext, verticalListSortingStrategy, arrayMove} from "@dnd-kit/sortable";
import { useMemo } from "react";
import type { Block } from "../../types/contentTypes";
import SortableBlockItem from "./SortableBlockItem";

type Props = {
  blocks: Block[];
  onReorder: (next: Block[]) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updater: (b: Block) => Block) => void;
};

export default function BlocksEditorDnd({
  blocks,
  onReorder,
  onRemove,
  onUpdate,
}: Props) {
  const ids = useMemo(() => blocks.map((b) => b.id), [blocks]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);

    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(blocks, oldIndex, newIndex);
    onReorder(next);
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {blocks.map((b, index) => (
            <SortableBlockItem
              key={b.id}
              block={b}
              index={index}
              onRemove={onRemove}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Card } from "./card/card";
import { useAtomValue } from "jotai";
import { activeGridIdState } from "../states/activeGridIdState";
import { BookmarkTreeNode } from "../types/BookmarkTreeNode";
import { useDroppable } from "@dnd-kit/core";
import { generateDndId } from "../utils/dndId";

type SortingGridProps = {
  items: BookmarkTreeNode[];
  id: string;
};

export const SortingGrid = ({ items, id }: SortingGridProps) => {
  const activeGridId = useAtomValue(activeGridIdState);
  const { setNodeRef } = useDroppable({
    id: generateDndId(id, "droppable"),
    disabled: activeGridId[activeGridId.length - 1] !== id,
  });

  return (
    <div
      ref={setNodeRef}
      className="grid p-4 w-full auto-rows-[140px] grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] justify-items-center gap-4"
    >
      <SortableContext
        items={items}
        strategy={rectSortingStrategy}
        id={generateDndId(id, "sortable")}
        disabled={activeGridId[activeGridId.length - 1] !== id}
      >
        {items.map((bookmark) => (
          <Card key={bookmark.id} id={bookmark.id} bookmark={bookmark}>
            {bookmark.title}
          </Card>
        ))}
      </SortableContext>
    </div>
  );
};

import { useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { useAtomValue } from "jotai";
import { useOpenDelay } from "../hooks/useOpenDelay";
import { activeGridIdState } from "../states/activeGridIdState";
import { BookmarkTreeNode } from "../types/BookmarkTreeNode";
import { generateDndId } from "../utils/dndId";
import { Card } from "./card/card";
import { CardAddNew } from "./card-add-new";

type SortingGridProps = {
  items: BookmarkTreeNode[];
  id: string;
};

export const SortingGrid = ({ items, id }: SortingGridProps) => {
  const activeGridId = useAtomValue(activeGridIdState);
  const isOpen = useOpenDelay(activeGridId[activeGridId.length - 1] === id);
  const { setNodeRef } = useDroppable({
    id: generateDndId(id, "droppable"),
    disabled: !isOpen,
  });

  return (
    <div
      ref={setNodeRef}
      className="grid p-4 grow auto-rows-[160px] grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] justify-items-center gap-4"
    >
      <SortableContext
        items={items}
        strategy={rectSortingStrategy}
        id={generateDndId(id, "sortable")}
        disabled={!isOpen}
      >
        {items.map((bookmark) => (
          <Card key={bookmark.id} id={bookmark.id} bookmark={bookmark}>
            {bookmark.title}
          </Card>
        ))}
      </SortableContext>
      <CardAddNew parentId={id} />
    </div>
  );
};

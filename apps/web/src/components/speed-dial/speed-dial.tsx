import {
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useCallback, useEffect, useState } from "react";
import { useCollisionDetection } from "../../hooks/useCollisionDetection";
import { CardOverlay } from "../card-overlay";
import { SortingGrid } from "../sorting-grid";
import { bookmarks, bookmarksState } from "../../states/bookmarks";
import { BookmarkTreeNode } from "../../types/BookmarkTreeNode";
import { parseDndId } from "../../utils/dndId";
import { useAtom } from "jotai";

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "1",
        scale: "1.05",
      },
      dragOverlay: {
        opacity: "0.8",
        scale: "1",
      },
    },
  }),
};

export const SpeedDial = () => {
  const [activeId, setActiveId] = useState<null | BookmarkTreeNode>(null);
  const [items, setItems] = useAtom(bookmarksState);

  useEffect(() => {
    bookmarks.getTree().then((tree) => setItems(tree));
  }, []);

  const { collisionDetection, onDragEnd } = useCollisionDetection(16);

  const handleDragStart = useCallback(async (event: DragStartEvent) => {
    const { active } = event;

    const [current] = await bookmarks.get(String(active?.id));
    setActiveId(current);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      const overId = String(over?.id);
      const activeId = String(active?.id);

      if (over && activeId !== overId) {
        const [newIndex] = await bookmarks.get(parseDndId(overId));
        bookmarks.move(activeId, {
          index: newIndex?.index ?? 0,
        });
        setItems(await bookmarks.getTree());
      }

      onDragEnd();

      setActiveId(null);
    },
    [onDragEnd]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragOver = useCallback(async (event: DragOverEvent) => {
    const { over, active } = event;

    const overId = String(over?.id);
    const activeId = String(active?.id);

    const isParent = Boolean(over?.data.current?.sortable?.containerId);

    if (over && !over.disabled && activeId !== overId) {
      const [newIndex] = await bookmarks.get(parseDndId(overId));

      bookmarks.move(activeId, {
        index: newIndex?.index ?? 0,
        parentId: isParent ? newIndex?.parentId : newIndex?.id,
      });
      setItems(await bookmarks.getTree());
    }
  }, []);

  return (
    <div className="flex justify-center items-center">
      <DndContext
        collisionDetection={collisionDetection}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        sensors={sensors}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        <SortingGrid items={items} id="root________" />
        <DragOverlay dropAnimation={dropAnimation}>
          {activeId ? <CardOverlay>{activeId.title}</CardOverlay> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

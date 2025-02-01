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
import { bookmarks } from "../../states/bookmarks";
import { BookmarkTreeNode } from "../../types/BookmarkTreeNode";
import { parseDndId } from "../../utils/dndId";

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "1",
      },
    },
  }),
};

export const App = () => {
  const [activeId, setActiveId] = useState<null | BookmarkTreeNode>(null);
  const [items, setItems] = useState<BookmarkTreeNode[]>([]);

  useEffect(() => {
    const tree = bookmarks.getTree();
    setItems(tree);
  }, []);

  const { collisionDetection, onDragEnd } = useCollisionDetection(16);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;

    const [current] = bookmarks.get(String(active?.id));
    setActiveId(current);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      const overId = String(over?.id);
      const activeId = String(active?.id);

      if (over && activeId !== overId) {
        const [newIndex] = bookmarks.get(parseDndId(overId));
        bookmarks.move(activeId, {
          index: newIndex?.index ?? 0,
        });
        setItems(bookmarks.getTree());
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

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over, active } = event;

    const overId = String(over?.id);
    const activeId = String(active?.id);

    const isParent = Boolean(over?.data.current?.sortable?.containerId);
    const shouldMove =
      over?.data.current?.sortable?.containerId !==
      active.data.current?.sortable?.containerId;

    if (shouldMove && over && !over.disabled && activeId !== overId) {
      const [newIndex] = bookmarks.get(parseDndId(overId));

      bookmarks.move(activeId, {
        index: newIndex?.index ?? 0,
        parentId: isParent ? newIndex?.parentId : newIndex?.id,
      });
      setItems(bookmarks.getTree());
    }
  }, []);

  return (
    <div className="flex h-screen bg-primary-background w-full justify-center items-center">
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
        <SortingGrid items={items} id="root" />
        <DragOverlay dropAnimation={dropAnimation}>
          {activeId ? <CardOverlay>{activeId.title}</CardOverlay> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

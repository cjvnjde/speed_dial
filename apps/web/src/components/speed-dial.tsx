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
import { useCallback, useEffect, useRef, useState } from "react";
import { useCollisionDetection } from "../hooks/useCollisionDetection";
import { CardOverlay } from "./card-overlay";
import { SortingGrid } from "./sorting-grid";
import { bookmarks, bookmarksState } from "../states/bookmarks";
import { BookmarkTreeNode } from "../types/BookmarkTreeNode";
import { parseDndId } from "../utils/dndId";
import { useAtom, useSetAtom } from "jotai";

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

function transformJSONtoBookmarks(
  data: any[],
  parent?: any
): BookmarkTreeNode[] {
  const parentId = parent?.guid ?? "root________";

  return data.map<BookmarkTreeNode>((item: any, index) => {
    if ("children" in item) {
      return {
        id: item.guid,
        parentId,
        index,
        type: "folder",
        title: item.title,
        dateAdded: item.dateAdded,
        dateGroupModified: item.lastModified,
        children: transformJSONtoBookmarks(item.children, item),
      };
    }

    return {
      id: item.guid,
      parentId,
      index,
      url: item.uri,
      title: item.title,
      dateAdded: item.dateAdded,
      dateGroupModified: item.lastModified,
      type: "bookmark",
    };
  });
}

const ImportBookmarks = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const setItems = useSetAtom(bookmarksState);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={(event) => {
          const files = (event.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            const file = files[0]; // Get the first selected file
            if (
              file.type === "application/json" ||
              file.name.endsWith(".json")
            ) {
              const reader = new FileReader();
              reader.onload = (loadEvent) => {
                try {
                  const fileContent = JSON.parse(
                    loadEvent.target?.result as string
                  );

                  bookmarks.setTree(
                    transformJSONtoBookmarks(
                      (fileContent as any).children.find(
                        (item: any) => item.guid === "toolbar_____"
                      )?.children
                    )
                  );

                  setItems(bookmarks.getTree());
                } catch (error) {
                  console.error("Error parsing JSON:", error);
                }
              };
              reader.onerror = (readError) => {
                console.error("Error reading file:", readError);
              };
              reader.readAsText(file);
            } else {
              console.error("Selected file is not a JSON file.");
            }
          }
        }}
      />
      <button
        type="button"
        className="text-white"
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        Import
      </button>
    </>
  );
};

export const SpeedDial = () => {
  const [activeId, setActiveId] = useState<null | BookmarkTreeNode>(null);
  const [items, setItems] = useAtom(bookmarksState);

  useEffect(() => {
    bookmarks.init().then((bookmarksApi) => {
      setItems(bookmarksApi.getTree());
    });
  }, [setItems]);

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
    [onDragEnd, setItems]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over, active } = event;

      const overId = String(over?.id);
      const activeId = String(active?.id);

      const isParent = Boolean(over?.data.current?.sortable?.containerId);

      if (over && !over.disabled && activeId !== overId) {
        const [newIndex] = bookmarks.get(parseDndId(overId));

        bookmarks.move(activeId, {
          index: newIndex?.index ?? 0,
          parentId: isParent ? newIndex?.parentId : newIndex?.id,
        });
        setItems(bookmarks.getTree());
      }
    },
    [setItems]
  );

  return (
    <div className="relative flex justify-center items-center">
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
          {activeId ? <CardOverlay bookmark={activeId} /> : null}
        </DragOverlay>
      </DndContext>
      <div className="fixed bottom-0 right-0">
        <ImportBookmarks />
      </div>
    </div>
  );
};

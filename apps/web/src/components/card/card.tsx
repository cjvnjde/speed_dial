import { useSortable } from "@dnd-kit/sortable";
import { useMergeRefs } from "../../hooks/useMergeRefs";
import { useIsHovered } from "../../hooks/useIsHovered";
import { cardStyle } from "./card-style";
import { CSS } from "@dnd-kit/utilities";
import { SortableItemProps } from "./card-props";
import { useCallback } from "react";
import { useActionOnHold } from "../../hooks/useActianOnHold";
import { useAtom } from "jotai";
import { OverlayPopup } from "../overlay-popup";
import { SortingGrid } from "../sorting-grid";
import { activeGridIdState } from "../../states/activeGridIdState";
import { IconFolder } from "@tabler/icons-react";

export const Card = ({ id, bookmark }: SortableItemProps) => {
  const {
    active,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
  });

  const isActive = Boolean(active);

  const { isHovered, ref: elementRef } = useIsHovered({
    disabled: !(isActive && !isDragging),
  });

  const ref = useMergeRefs<HTMLElement | null>(elementRef, setNodeRef);

  const [openedGrids, setActiveGridId] = useAtom(activeGridIdState);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOpen = openedGrids.includes(String(id));

  useActionOnHold(
    useCallback(() => {
      setActiveGridId((previous) => [...previous, bookmark.id]);
    }, [setActiveGridId, bookmark.id]),
    {
      disabled: !(isHovered && !isOpen && bookmark.type === "folder"),
      delay: 1000,
    }
  );

  const handlePopupClose = useCallback(() => {
    setActiveGridId((previous) =>
      previous.filter((value) => value !== String(id))
    );
  }, [id, setActiveGridId]);

  const handleOnClick = useCallback(() => {
    if (bookmark.type === "folder") {
      setActiveGridId((previous) => [...previous, bookmark.id]);
    }
  }, [bookmark.id, bookmark.type, setActiveGridId]);

  if (bookmark.type === "folder") {
    return (
      <>
        <button
          ref={ref}
          className={cardStyle({
            dragging: isDragging,
            hovered: isHovered,
            type: "folder",
          })}
          style={style}
          onClick={handleOnClick}
          {...attributes}
          {...listeners}
        >
          <div className="flex items-center flex-col w-full h-full">
            <div className="flex grow justify-center items-center">
              <IconFolder size={48} />
            </div>
            <span>{bookmark.title}</span>
          </div>
        </button>
        <OverlayPopup
          isOpen={isOpen}
          onClose={handlePopupClose}
          isActive={
            isActive && openedGrids[openedGrids.length - 1] === String(id)
          }
        >
          <SortingGrid items={bookmark.children ?? []} id={bookmark.id} />
        </OverlayPopup>
      </>
    );
  }

  return (
    <a
      href={bookmark.url}
      ref={ref}
      className={cardStyle({
        dragging: isDragging,
        hovered: isHovered,
        type: "bookmark",
      })}
      style={style}
      onClick={handleOnClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center overflow-hidden flex-col w-full h-full">
        <div className="flex overflow-hidden w-full grow justify-center items-center">
          <span className="truncate">{bookmark.url}</span>
        </div>

        <span className="truncate w-full text-center">{bookmark.title}</span>
      </div>
    </a>
  );
};

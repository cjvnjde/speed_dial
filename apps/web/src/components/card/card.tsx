import { useSortable } from "@dnd-kit/sortable";
import { useMergeRefs } from "../../hooks/useMergeRefs";
import { useIsHovered } from "../../hooks/useIsHovered";
import { cardStyle } from "./cardStyle";
import { CSS } from "@dnd-kit/utilities";
import { SortableItemProps } from "./card-props";
import { useCallback } from "react";
import { useActionOnHold } from "../../hooks/useActianOnHold";
import { useAtom } from "jotai";
import { OverlayPopup } from "../overlay-popup";
import { SortingGrid } from "../sorting-grid";
import { activeGridIdState } from "../../states/activeGridIdState";

export const Card = ({ id, children, bookmark }: SortableItemProps) => {
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

  return (
    <>
      <div
        ref={ref}
        className={cardStyle({ dragging: isDragging, hovered: isHovered })}
        style={style}
        onClick={handleOnClick}
        {...attributes}
        {...listeners}
      >
        {children}
      </div>
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
};

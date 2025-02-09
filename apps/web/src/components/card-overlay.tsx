import { cardStyle } from "./card/card-style";
import { SortableItemProps } from "./card/card-props";

export const CardOverlay = ({ bookmark }: Omit<SortableItemProps, "id">) => {
  return (
    <div className={cardStyle({ dragging: true, overlay: true })}>
      {bookmark.title}
    </div>
  );
};

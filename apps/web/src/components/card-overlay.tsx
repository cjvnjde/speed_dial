import { cardStyle } from "./card/card-style";
import { SortableItemProps } from "./card/card-props";

export const CardOverlay = ({
  children,
}: Omit<SortableItemProps, "id" | "bookmark">) => {
  return (
    <div className={cardStyle({ dragging: true, overlay: true })}>
      {children}
    </div>
  );
};

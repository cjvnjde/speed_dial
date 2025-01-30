import { CardContent, cardStyle, SortableItemProps } from "./card";

export const CardOverlay = ({ bookmark }: Omit<SortableItemProps, "id">) => {
  return (
    <div className={cardStyle({ dragging: true, overlay: true })}>
      <CardContent bookmark={bookmark} />
    </div>
  );
};

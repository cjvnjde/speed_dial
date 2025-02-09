import { IconFolder } from "@tabler/icons-react";
import { SortableItemProps } from "./card-props";

export const CardContent = ({
  bookmark,
}: Pick<SortableItemProps, "bookmark">) => {
  if (bookmark.type === "folder") {
    return (
      <div className="flex items-center flex-col w-full h-full">
        <div className="flex grow justify-center items-center">
          <IconFolder size={48} />
        </div>
        <span>{bookmark.title}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center overflow-hidden flex-col w-full h-full">
      <div className="flex overflow-hidden w-full grow justify-center items-center">
        <span className="truncate">{bookmark.url}</span>
      </div>

      <span className="truncate w-full text-center">{bookmark.title}</span>
    </div>
  );
};

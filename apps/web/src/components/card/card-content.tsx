import { IconFolder } from "@tabler/icons-react";
import { SortableItemProps } from "./card-props";
import { MoreOptions } from "../more-options";
import { bookmarks, bookmarksState } from "../../states/bookmarks";
import { useSetAtom } from "jotai";

export const CardContent = ({
  bookmark,
}: Pick<SortableItemProps, "bookmark">) => {
  const setItems = useSetAtom(bookmarksState);

  if (bookmark.type === "folder") {
    return (
      <div className="relative flex items-center flex-col w-full h-full">
        <MoreOptions className="absolute top-0 right-0">
          <MoreOptions.Option
            onClick={() => {
              bookmarks.removeTree(String(bookmark.id));

              setItems(bookmarks.getTree());
            }}
          >
            Delete
          </MoreOptions.Option>
        </MoreOptions>
        <div className="flex grow justify-center items-center">
          <IconFolder size={48} />
        </div>
        <span>{bookmark.title}</span>
      </div>
    );
  }

  return (
    <div className="relative flex items-center overflow-hidden flex-col w-full h-full">
      <MoreOptions className="absolute top-0 right-0">
        <MoreOptions.Option
          onClick={() => {
            bookmarks.remove(String(bookmark.id));

            setItems(bookmarks.getTree());
          }}
        >
          Delete
        </MoreOptions.Option>
      </MoreOptions>
      <div className="flex overflow-hidden w-full grow justify-center items-center">
        <span className="truncate">{bookmark.url}</span>
      </div>

      <span className="truncate w-full text-center">{bookmark.title}</span>
    </div>
  );
};

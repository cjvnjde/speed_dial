import { IconFolder } from "@tabler/icons-react";
import { SortableItemProps } from "./card-props";
import { MoreOptions } from "../more-options";
import { bookmarks, bookmarksState } from "../../states/bookmarks";
import { useSetAtom } from "jotai";

function getBaseUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch {
    return null;
  }
}

function getLetter(url: string) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname[0] ?? "U";
  } catch {
    return "U";
  }
}

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

  const baseUrl = getBaseUrl(bookmark.url ?? "") ?? "";
  const iconUrl = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${baseUrl}&size=128`;

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
        <img
          src={iconUrl}
          width={100}
          height={100}
          alt={getLetter(bookmark.url ?? "")}
        />
      </div>
      <span className="truncate w-full text-center">{bookmark.title}</span>
    </div>
  );
};

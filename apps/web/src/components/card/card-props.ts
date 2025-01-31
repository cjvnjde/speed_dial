import { PropsWithChildren } from "react";
import { BookmarkTreeNode } from "../../types/BookmarkTreeNode";

export type SortableItemProps = PropsWithChildren<{
  id: string | number;
  bookmark: BookmarkTreeNode;
}>;

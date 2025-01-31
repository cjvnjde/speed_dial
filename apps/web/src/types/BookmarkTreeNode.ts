export type BookmarkTreeNodeType = "bookmark" | "folder" | "separator";
export type BookmarkTreeNodeUnmodifiable = "managed";

export type BookmarkId = string;

export type BookmarkTreeNode = {
  id: BookmarkId;
  parentId?: BookmarkId;
  index?: number;
  url?: string;
  title: string;
  dateAdded?: number;
  dateGroupModified?: number;
  type?: BookmarkTreeNodeType;
  children?: BookmarkTreeNode[];
  unmodifiable?: BookmarkTreeNodeUnmodifiable;
};

export interface CreateDetails {
  parentId?: BookmarkId;
  index?: number;
  title?: string;
  url?: string;
  type?: BookmarkTreeNodeType;
}

export type Destination =
  | {
      parentId: BookmarkId;
      index?: number;
    }
  | {
      parentId?: BookmarkId;
      index: number;
    }
  | {
      parentId: BookmarkId;
      index: number;
    };

export type Query =
  | string
  | {
      query?: string;
      url?: string;
      title?: string;
    };

export type HistoryItem = {
  id: string;
  url?: string;
  title?: string;
  lastVisitTime?: number;
  visitCount?: number;
  typedCount?: number;
};

export type UpdateChanges = {
  title?: string;
  url?: string;
};

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

export type SearchQuery = { query?: string; url?: string; title?: string };
export type Query = string | SearchQuery;

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

export interface BookmarksApiStore {
  get(idOrIdList: string | string[]): Promise<BookmarkTreeNode[]>;
  getChildren(id: string): Promise<BookmarkTreeNode[]>;
  getRecent(numberOfItems: number): Promise<BookmarkTreeNode[]>;
  getTree(): Promise<BookmarkTreeNode[]>;
  getSubTree(id: string): Promise<BookmarkTreeNode[]>;
  search(query: Query): Promise<BookmarkTreeNode[]>;
  create(bookmark: CreateDetails): Promise<BookmarkTreeNode>;
  move(id: string, destination: Destination): Promise<BookmarkTreeNode>;
  update(id: string, changes: UpdateChanges): Promise<BookmarkTreeNode>;
  remove(id: string): Promise<void>;
  removeTree(id: string): Promise<void>;
}

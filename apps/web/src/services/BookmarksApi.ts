import { DBSchema, IDBPDatabase, openDB } from "idb";
import {
  BookmarkId,
  BookmarkTreeNode,
  CreateDetails,
  Destination,
  UpdateChanges,
} from "../types/BookmarkTreeNode";
import { WebExtEventEmitter } from "./WebExtEventEmitter";

interface BookmarkDB extends DBSchema {
  bookmarks: {
    value: Omit<BookmarkTreeNode, "children">;
    key: BookmarkTreeNode["id"];
  };
}

class BookmarkTreeNodeMap {
  private db: IDBPDatabase<BookmarkDB> | null = null;
  private readonly storeName = "bookmarks" as const;

  async open() {
    if (this.db) return;

    this.db = await openDB<BookmarkDB>("bookmark_db", 1, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" });
        }
      },
    });
  }

  async get(id: BookmarkId): Promise<BookmarkTreeNode | undefined> {
    await this.open();

    return this.db?.get(this.storeName, id);
  }

  async set(_id: BookmarkId, node: BookmarkTreeNode): Promise<void> {
    await this.open();

    await this.db?.put(this.storeName, node);
  }

  async delete(id: BookmarkId): Promise<void> {
    await this.open();
    await this.db?.delete(this.storeName, id);
  }

  async clear(): Promise<void> {
    await this.open();
    const tx = this.db?.transaction(this.storeName, "readwrite");
    const store = tx?.objectStore(this.storeName);
    await store?.clear();
    return tx?.done;
  }

  async values(): Promise<BookmarkTreeNode[]> {
    await this.open();
    const tx = this.db?.transaction(this.storeName, "readonly");
    const store = tx?.objectStore(this.storeName);
    return store?.getAll() ?? [];
  }
}

export class BookmarksApi {
  private nodes = new BookmarkTreeNodeMap();
  private rootParentId = "root________";

  public readonly onCreated = new WebExtEventEmitter();
  public readonly onRemoved = new WebExtEventEmitter();
  public readonly onChanged = new WebExtEventEmitter();
  public readonly onMoved = new WebExtEventEmitter();

  constructor(initialState: BookmarkTreeNode[] = []) {
    this.populateNodes(initialState, this.rootParentId);
  }

  private populateNodes(nodes: BookmarkTreeNode[], parentId: string) {
    nodes.forEach((node, index) => {
      const newNode: BookmarkTreeNode = {
        ...node,
        parentId: node.parentId || parentId,
        index: node.index ?? index,
        children: undefined,
      };

      this.nodes.set(newNode.id, newNode);

      if (node.children) {
        this.populateNodes(node.children, newNode.id);
      }
    });
  }

  private async getNode(id: string): Promise<BookmarkTreeNode | undefined> {
    return await this.nodes.get(id);
  }

  private async getSortedChildren(
    parentId: string
  ): Promise<BookmarkTreeNode[]> {
    return Array.from(await this.nodes.values())
      .filter((n) => n.parentId === parentId)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  }

  private async buildTree(node: BookmarkTreeNode): Promise<BookmarkTreeNode> {
    const children = await Promise.all(
      (await this.getSortedChildren(node.id)).map((n) => this.buildTree(n))
    );

    return { ...node, children };
  }

  public async get(idOrIdList: string | string[]): Promise<BookmarkTreeNode[]> {
    const ids = Array.isArray(idOrIdList) ? idOrIdList : [idOrIdList];

    return (
      await Promise.all(
        ids.map(async (id) => {
          const node = await this.getNode(id);

          if (node) {
            return this.buildTree(node);
          }

          return null;
        })
      )
    ).filter(Boolean) as BookmarkTreeNode[];
  }

  public async getChildren(id: string): Promise<BookmarkTreeNode[]> {
    return Promise.all(
      (await this.getSortedChildren(id)).map((n) => this.buildTree(n))
    );
  }

  public async getRecent(numberOfItems: number): Promise<BookmarkTreeNode[]> {
    return Promise.all(
      Array.from(await this.nodes.values())
        .filter((n) => n.type === "bookmark")
        .sort((a, b) => (b.dateAdded ?? 0) - (a.dateAdded ?? 0))
        .slice(0, numberOfItems)
        .map((n) => this.buildTree(n))
    );
  }

  public async getTree(): Promise<BookmarkTreeNode[]> {
    return this.getChildren(this.rootParentId);
  }

  public async getSubTree(id: string): Promise<BookmarkTreeNode[]> {
    const node = await this.getNode(id);

    return node ? [await this.buildTree(node)] : [];
  }

  public async search(
    query: string | { query?: string; url?: string; title?: string }
  ): Promise<BookmarkTreeNode[]> {
    const searchParams = typeof query === "string" ? { query } : query;
    const searchQuery = searchParams.query?.toLowerCase();
    const searchUrl = searchParams.url?.toLowerCase();
    const searchTitle = searchParams.title?.toLowerCase();

    return Promise.all(
      Array.from(await this.nodes.values())
        .filter((n) => {
          const matchesTitle = searchTitle
            ? n.title.toLowerCase().includes(searchTitle)
            : true;
          const matchesUrl = searchUrl
            ? n.url?.toLowerCase().includes(searchUrl)
            : true;
          const matchesQuery = searchQuery
            ? n.title?.toLowerCase().includes(searchQuery) ||
              n.url?.toLowerCase().includes(searchQuery)
            : true;

          return matchesTitle && matchesUrl && matchesQuery;
        })
        .map((n) => this.buildTree(n))
    );
  }

  public async create(bookmark: CreateDetails): Promise<BookmarkTreeNode> {
    const id = `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const parentId = bookmark.parentId || "unfiled_____";
    const parent = await this.getNode(parentId);

    if (parentId !== this.rootParentId && !parent) {
      throw new Error("Parent not found");
    }

    const type = bookmark.type || (bookmark.url ? "bookmark" : "folder");
    const index =
      bookmark.index ?? (await this.getSortedChildren(parentId)).length;

    (await this.getSortedChildren(parentId))
      .filter((n) => (n.index ?? 0) >= index)
      .forEach((n) =>
        this.nodes.set(n.id, { ...n, index: (n.index ?? 0) + 1 })
      );

    const newNode: BookmarkTreeNode = {
      id,
      parentId,
      index,
      title:
        bookmark.title || (type === "folder" ? "New Folder" : "New Bookmark"),
      type,
      url: type !== "folder" ? bookmark.url : undefined,
      dateAdded: Date.now(),
      dateGroupModified: type === "folder" ? Date.now() : undefined,
    };

    await this.nodes.set(id, newNode);

    if (parent) {
      await this.nodes.set(parent.id, {
        ...parent,
        dateGroupModified: Date.now(),
      });
    }

    this.onCreated.emit(id, { ...newNode });
    return newNode;
  }

  public async move(
    id: string,
    destination: Destination
  ): Promise<BookmarkTreeNode> {
    const node = await this.getNode(id);

    if (!node) {
      throw new Error("Node not found");
    }

    const oldParentId = node.parentId!;
    const newParentId = destination.parentId || oldParentId;
    const newIndex =
      destination.index ?? (await this.getSortedChildren(newParentId)).length;

    if (newParentId !== oldParentId) {
      (await this.getSortedChildren(oldParentId))
        .filter((n) => (n.index ?? 0) > (node.index ?? 0))
        .forEach((n) =>
          this.nodes.set(n.id, { ...n, index: (n.index ?? 1) - 1 })
        );

      (await this.getSortedChildren(newParentId))
        .filter((n) => (n.index ?? 0) >= newIndex)
        .forEach((n) =>
          this.nodes.set(n.id, { ...n, index: (n.index ?? 0) + 1 })
        );
    } else if (newIndex !== node.index) {
      const children = await this.getSortedChildren(oldParentId);
      children.splice(node.index ?? 0, 1);
      children.splice(newIndex, 0, node);
      children.forEach((n, i) => this.nodes.set(n.id, { ...n, index: i }));
    }

    const movedNode = { ...node, parentId: newParentId, index: newIndex };
    this.nodes.set(id, movedNode);

    this.onMoved.emit(id, {
      parentId: newParentId,
      index: newIndex,
      oldParentId,
      oldIndex: node.index,
    });

    return movedNode;
  }

  public async update(
    id: string,
    changes: UpdateChanges
  ): Promise<BookmarkTreeNode> {
    const node = await this.getNode(id);
    if (!node) throw new Error("Node not found");

    const updatedNode = { ...node };
    if (changes.title) updatedNode.title = changes.title;
    if (changes.url && updatedNode.type !== "folder")
      updatedNode.url = changes.url;

    this.nodes.set(id, updatedNode);

    this.onChanged.emit(id, {
      title: updatedNode.title,
      url: updatedNode.url,
    });

    return updatedNode;
  }

  public async remove(id: string): Promise<void> {
    const node = await this.getNode(id);
    if (!node) throw new Error("Node not found");

    if (
      node.type === "folder" &&
      (await this.getSortedChildren(id)).length > 0
    ) {
      throw new Error("Cannot remove non-empty folder");
    }

    const parentId = node.parentId!;
    (await this.getSortedChildren(parentId))
      .filter((n) => (n.index ?? 0) > (node.index ?? 0))
      .forEach((n) =>
        this.nodes.set(n.id, { ...n, index: (n.index ?? 1) - 1 })
      );

    this.nodes.delete(id);

    this.onRemoved.emit(id, {
      parentId,
      index: node.index,
      node,
    });
  }

  public async removeTree(id: string): Promise<void> {
    const node = await this.nodes.get(id);
    if (!node) throw new Error("Node not found");

    const parentId = node.parentId!;
    const queue = [id];
    while (queue.length > 0) {
      const currentId = queue.pop()!;
      const children = await this.getSortedChildren(currentId);
      children.forEach((child) => queue.push(child.id));
      this.nodes.delete(currentId);
    }

    (await this.getSortedChildren(parentId))
      .filter((n) => (n.index ?? 0) > (node.index ?? 0))
      .forEach((n) =>
        this.nodes.set(n.id, { ...n, index: (n.index ?? 1) - 1 })
      );

    this.onRemoved.emit(id, {
      parentId,
      index: node.index,
      node,
    });
  }
}

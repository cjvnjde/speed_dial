import {
  BookmarkTreeNode,
  CreateDetails,
  Destination,
  UpdateChanges,
} from "../types/BookmarkTreeNode";
import { BookmarksApi } from "./BookmarksApi";

class WebExtEventEmitter<T extends (...args: unknown[]) => void> {
  private listeners: T[] = [];

  addListener(callback: T) {
    this.listeners.push(callback);
  }

  removeListener(callback: T) {
    const index = this.listeners.indexOf(callback);
    if (index >= 0) this.listeners.splice(index, 1);
  }

  hasListener(callback: T) {
    return this.listeners.includes(callback);
  }

  emit(...args: Parameters<T>) {
    this.listeners.slice().forEach((listener) => listener(...args));
  }
}

export class SyncBookmarksAdapter {
  private nodes = new Map<string, BookmarkTreeNode>();
  private rootParentId = "root________";

  public readonly onCreated = new WebExtEventEmitter();
  public readonly onRemoved = new WebExtEventEmitter();
  public readonly onChanged = new WebExtEventEmitter();
  public readonly onMoved = new WebExtEventEmitter();

  constructor(private readonly bookmarksApi: BookmarksApi) {
    this.bookmarksApi
      .getTree()
      .then((nodeTree) => this.populateNodes(nodeTree, this.rootParentId));
    // Subscribe to the bookmarks API events
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

  private getNode(id: string): BookmarkTreeNode | undefined {
    return this.nodes.get(id);
  }

  private getSortedChildren(parentId: string): BookmarkTreeNode[] {
    return Array.from(this.nodes.values())
      .filter((n) => n.parentId === parentId)
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  }

  private buildTree(node: BookmarkTreeNode): BookmarkTreeNode {
    const children = this.getSortedChildren(node.id).map((n) =>
      this.buildTree(n)
    );

    return { ...node, children };
  }

  // Implemented API methods
  public get(idOrIdList: string | string[]): BookmarkTreeNode[] {
    const ids = Array.isArray(idOrIdList) ? idOrIdList : [idOrIdList];

    return ids
      .map((id) => {
        const node = this.getNode(id);

        if (node) {
          return this.buildTree(node);
        }

        return null;
      })
      .filter(Boolean) as BookmarkTreeNode[];
  }

  public getChildren(id: string): BookmarkTreeNode[] {
    return this.getSortedChildren(id).map((n) => this.buildTree(n));
  }

  public getRecent(numberOfItems: number): BookmarkTreeNode[] {
    return Array.from(this.nodes.values())
      .filter((n) => n.type === "bookmark")
      .sort((a, b) => (b.dateAdded ?? 0) - (a.dateAdded ?? 0))
      .slice(0, numberOfItems)
      .map((n) => this.buildTree(n));
  }

  public getTree(): BookmarkTreeNode[] {
    return this.getChildren(this.rootParentId);
  }

  public getSubTree(id: string): BookmarkTreeNode[] {
    const node = this.getNode(id);

    return node ? [this.buildTree(node)] : [];
  }

  public search(
    query: string | { query?: string; url?: string; title?: string }
  ): BookmarkTreeNode[] {
    const searchParams = typeof query === "string" ? { query } : query;
    const searchQuery = searchParams.query?.toLowerCase();
    const searchUrl = searchParams.url?.toLowerCase();
    const searchTitle = searchParams.title?.toLowerCase();

    return Array.from(this.nodes.values())
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
      .map((n) => this.buildTree(n));
  }

  public create(bookmark: CreateDetails): BookmarkTreeNode {
    const id = `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const parentId = bookmark.parentId || "unfiled_____";
    const parent = this.getNode(parentId);

    if (parentId !== this.rootParentId && !parent) {
      throw new Error("Parent not found");
    }

    const type = bookmark.type || (bookmark.url ? "bookmark" : "folder");
    const index = bookmark.index ?? this.getSortedChildren(parentId).length;

    this.getSortedChildren(parentId)
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

    this.nodes.set(id, newNode);

    if (parent) {
      this.nodes.set(parent.id, { ...parent, dateGroupModified: Date.now() });
    }

    this.onCreated.emit(id, { ...newNode });
    return newNode;
  }

  public move(id: string, destination: Destination): BookmarkTreeNode {
    const node = this.getNode(id);

    if (!node) {
      throw new Error("Node not found");
    }

    const oldParentId = node.parentId!;
    const newParentId = destination.parentId || oldParentId;
    const newIndex =
      destination.index ?? this.getSortedChildren(newParentId).length;

    if (newParentId !== oldParentId) {
      this.getSortedChildren(oldParentId)
        .filter((n) => (n.index ?? 0) > (node.index ?? 0))
        .forEach((n) =>
          this.nodes.set(n.id, { ...n, index: (n.index ?? 1) - 1 })
        );

      this.getSortedChildren(newParentId)
        .filter((n) => (n.index ?? 0) >= newIndex)
        .forEach((n) =>
          this.nodes.set(n.id, { ...n, index: (n.index ?? 0) + 1 })
        );
    } else if (newIndex !== node.index) {
      const children = this.getSortedChildren(oldParentId);
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

    this.bookmarksApi.move(id, destination);

    return movedNode;
  }

  public update(id: string, changes: UpdateChanges): BookmarkTreeNode {
    const node = this.nodes.get(id);
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

    this.bookmarksApi.update(id, changes);

    return updatedNode;
  }

  public remove(id: string): void {
    const node = this.nodes.get(id);
    if (!node) throw new Error("Node not found");

    if (node.type === "folder" && this.getSortedChildren(id).length > 0) {
      throw new Error("Cannot remove non-empty folder");
    }

    const parentId = node.parentId!;
    this.getSortedChildren(parentId)
      .filter((n) => (n.index ?? 0) > (node.index ?? 0))
      .forEach((n) =>
        this.nodes.set(n.id, { ...n, index: (n.index ?? 1) - 1 })
      );

    this.nodes.delete(id);

    this.bookmarksApi.remove(id);

    this.onRemoved.emit(id, {
      parentId,
      index: node.index,
      node,
    });
  }

  public removeTree(id: string): void {
    const node = this.nodes.get(id);
    if (!node) throw new Error("Node not found");

    const parentId = node.parentId!;
    const queue = [id];
    while (queue.length > 0) {
      const currentId = queue.pop()!;
      const children = this.getSortedChildren(currentId);
      children.forEach((child) => queue.push(child.id));
      this.nodes.delete(currentId);
    }

    this.getSortedChildren(parentId)
      .filter((n) => (n.index ?? 0) > (node.index ?? 0))
      .forEach((n) =>
        this.nodes.set(n.id, { ...n, index: (n.index ?? 1) - 1 })
      );

    this.bookmarksApi.removeTree(id);

    this.onRemoved.emit(id, {
      parentId,
      index: node.index,
      node,
    });
  }
}

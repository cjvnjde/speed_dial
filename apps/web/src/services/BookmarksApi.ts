import {
  BookmarkTreeNode,
  CreateDetails,
  Destination,
  UpdateChanges,
} from "../types/BookmarkTreeNode";
import { BookmarkTreeMap } from "./BookmarkTreeMap";

export class BookmarksApi {
  private nodes = new BookmarkTreeMap();
  private rootParentId = "root________";

  public async init() {
    await this.nodes.init();

    return this;
  }

  public async setTree(tree: BookmarkTreeNode[], parent = this.rootParentId) {
    tree.forEach((item) => {
      if (
        "children" in item &&
        item.children !== undefined &&
        item.type === "folder"
      ) {
        this.setTree(item.children, item.id);
      }

      this.nodes.set(parent, item);
    });
  }

  private getNode(id: string) {
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

  public get(idOrIdList: string | string[]): BookmarkTreeNode[] {
    const ids = Array.isArray(idOrIdList) ? idOrIdList : [idOrIdList];

    return ids.reduce<BookmarkTreeNode[]>((acc, id) => {
      const node = this.getNode(id);

      if (node) {
        acc.push(this.buildTree(node));
      }

      return acc;
    }, []);
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
      this.nodes.set(parent.id, {
        ...parent,
        dateGroupModified: Date.now(),
      });
    }

    return newNode;
  }

  public move(id: string, destination: Destination): BookmarkTreeNode {
    const node = this.getNode(id);

    if (!node) {
      throw new Error("Node not found");
    }

    const oldParentId = node?.parentId ?? this.rootParentId;
    const newParentId = destination.parentId || oldParentId;
    const newIndex =
      destination.index ?? this.getSortedChildren(newParentId).length;

    if (newParentId !== oldParentId) {
      this.getSortedChildren(oldParentId)
        .filter((n) => (n.index ?? 0) > (node.index ?? 0))
        .map((n) => this.nodes.set(n.id, { ...n, index: (n.index ?? 1) - 1 }));

      this.getSortedChildren(newParentId)
        .filter((n) => (n.index ?? 0) >= newIndex)
        .map((n) => this.nodes.set(n.id, { ...n, index: (n.index ?? 0) + 1 }));
    } else if (newIndex !== node.index) {
      const children = this.getSortedChildren(oldParentId);
      children.splice(node.index ?? 0, 1);
      children.splice(newIndex, 0, node);
      children.forEach((n, i) => this.nodes.set(n.id, { ...n, index: i }));
    }

    const movedNode = { ...node, parentId: newParentId, index: newIndex };
    this.nodes.set(id, movedNode);

    return movedNode;
  }

  public update(id: string, changes: UpdateChanges): BookmarkTreeNode {
    const node = this.getNode(id);
    if (!node) throw new Error("Node not found");

    const updatedNode = { ...node };
    if (changes.title) updatedNode.title = changes.title;
    if (changes.url && updatedNode.type !== "folder")
      updatedNode.url = changes.url;

    this.nodes.set(id, updatedNode);

    return updatedNode;
  }

  public remove(id: string): void {
    const node = this.getNode(id);
    if (!node) throw new Error("Node not found");

    if (node.type === "folder" && this.getSortedChildren(id).length > 0) {
      throw new Error("Cannot remove non-empty folder");
    }

    const parentId = node.parentId ?? this.rootParentId;
    this.getSortedChildren(parentId)
      .filter((n) => (n.index ?? 0) > (node.index ?? 0))
      .forEach((n) =>
        this.nodes.set(n.id, { ...n, index: (n.index ?? 1) - 1 })
      );

    this.nodes.delete(id);
  }

  public removeTree(id: string): void {
    const node = this.nodes.get(id);
    if (!node) throw new Error("Node not found");

    const parentId = node.parentId ?? this.rootParentId;
    const queue = [id];
    while (queue.length > 0) {
      const currentId = queue.pop();

      if (currentId) {
        const children = this.getSortedChildren(currentId);
        children.forEach((child) => queue.push(child.id));
        this.nodes.delete(currentId);
      }
    }

    this.getSortedChildren(parentId)
      .filter((n) => (n.index ?? 0) > (node.index ?? 0))
      .forEach((n) =>
        this.nodes.set(n.id, { ...n, index: (n.index ?? 1) - 1 })
      );
  }
}

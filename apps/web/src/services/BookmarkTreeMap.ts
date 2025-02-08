import { DBSchema, IDBPDatabase, openDB } from "idb";
import { BookmarkTreeNode } from "../types/BookmarkTreeNode";

interface BookmarkDB extends DBSchema {
  bookmarks: {
    value: Omit<BookmarkTreeNode, "children">;
    key: BookmarkTreeNode["id"];
  };
}

type Action =
  | {
      type: "add";
      payload: BookmarkTreeNode;
    }
  | {
      type: "delete";
      payload: string;
    }
  | {
      type: "clear";
    };

export class BookmarkTreeMap {
  private state = new Map<BookmarkTreeNode["id"], BookmarkTreeNode>();
  private db: IDBPDatabase<BookmarkDB> | null = null;
  private readonly storeName = "bookmarks";
  private actionsQueue: Action[] = [];

  constructor() {
    this.init();
  }

  private async getDB(): Promise<IDBPDatabase<BookmarkDB>> {
    if (this.db) {
      return this.db;
    }

    this.db = await openDB<BookmarkDB>("bookmark_db", 1, {
      upgrade: (db) => {
        db.createObjectStore(this.storeName, { keyPath: "id" });
      },
    });

    return this.db;
  }

  async init() {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const values = (await store?.getAll()) ?? [];

    values.forEach((value) => {
      this.state.set(value.id, value);
    });
  }

  private timeout: ReturnType<typeof setTimeout> | null = null;
  private delay = 1000;

  private process() {
    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        this.commit();
        this.timeout = null;
      }, this.delay);
    }
  }

  private async commit() {
    const db = await this.getDB();
    const actions = [...this.actionsQueue];
    this.actionsQueue.splice(0, this.actionsQueue.length);

    await Promise.all(
      actions.map(async (action) => {
        switch (action.type) {
          case "add": {
            return db.put(this.storeName, action.payload);
          }
          case "delete": {
            return db.delete(this.storeName, action.payload);
          }
          case "clear": {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx?.objectStore(this.storeName);
            await store?.clear();
            return tx?.done;
          }
        }
      })
    );
  }

  clear(): void {
    this.actionsQueue.push({
      type: "clear",
    });
    this.process();
    this.state.clear();
  }

  delete(key: string): boolean {
    this.actionsQueue.push({
      type: "delete",
      payload: key,
    });
    this.process();
    return this.state.delete(key);
  }

  get(key: string): BookmarkTreeNode | undefined {
    return this.state.get(key);
  }

  has(key: string): boolean {
    return this.state.has(key);
  }

  set(key: string, value: BookmarkTreeNode): void {
    this.actionsQueue.push({
      type: "add",
      payload: value,
    });
    this.process();
    this.state.set(key, value);
  }

  values(): BookmarkTreeNode[] {
    return Array.from(this.state.values());
  }
}

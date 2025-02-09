import { BookmarkTreeNode } from "../types/BookmarkTreeNode";
import { BookmarksApi } from "../services/BookmarksApi";
import { atom } from "jotai";

export const bookmarks = new BookmarksApi();

export const bookmarksState = atom<BookmarkTreeNode[]>([]);


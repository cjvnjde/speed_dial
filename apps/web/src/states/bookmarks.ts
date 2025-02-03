import { BookmarkTreeNode } from "../types/BookmarkTreeNode";
import { BookmarksApi } from "../services/BookmarksApi";
import { atom } from "jotai";

const bookmarksInitialState: BookmarkTreeNode[] = [];

export const bookmarks = new BookmarksApi(bookmarksInitialState);

export const bookmarksState = atom<BookmarkTreeNode[]>([]);

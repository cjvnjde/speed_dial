const SORTABLE_POSTFIX = "________sortable";
const DROPPABLE_POSTFIX = "________droppable";

export function generateDndId(id: string, type: "sortable" | "droppable") {
  if (type === "sortable") {
    return id + SORTABLE_POSTFIX;
  }

  return id + DROPPABLE_POSTFIX;
}

export function parseDndId(id: string | null | undefined) {
  if (!id) {
    return "";
  }

  if (id.endsWith(SORTABLE_POSTFIX)) {
    return id.replace(SORTABLE_POSTFIX, "");
  }

  if (id.endsWith(DROPPABLE_POSTFIX)) {
    return id.replace(DROPPABLE_POSTFIX, "");
  }

  return String(id);
}

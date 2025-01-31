import { Coordinates } from "@dnd-kit/utilities";

export function isHovered(
  pointer: Coordinates | null,
  rect: DOMRect | undefined,
) {
  if (!pointer || !rect) {
    return false;
  }

  return (
    pointer.x > rect.x &&
    pointer.x < rect.x + rect.width &&
    pointer.y > rect.y &&
    pointer.y < rect.y + rect.height
  );
}

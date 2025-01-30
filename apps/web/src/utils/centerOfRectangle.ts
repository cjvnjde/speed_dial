import { ClientRect } from "@dnd-kit/core";

export function centerOfRectangle(
  rect: ClientRect,
  left = rect.left,
  top = rect.top
) {
  return {
    x: left + rect.width * 0.5,
    y: top + rect.height * 0.5,
  };
}

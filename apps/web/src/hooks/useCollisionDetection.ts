import { CollisionDescriptor, CollisionDetection } from "@dnd-kit/core";
import { useCallback, useRef } from "react";
import { centerOfRectangle } from "../utils/centerOfRectangle";
import { distanceBetween } from "../utils/distanceBetween";

export function useCollisionDetection(gap = 0) {
  const previousCandidate = useRef<CollisionDescriptor[]>([]);

  const collisionDetection = useCallback<CollisionDetection>(
    ({ active, collisionRect, droppableRects, droppableContainers }) => {
      const centerRect = centerOfRectangle(
        collisionRect,
        collisionRect.left,
        collisionRect.top
      );
      const collisions: CollisionDescriptor[] = [];

      const activeDropableContainer = droppableContainers.find(
        (container) => container.id === active.id
      );

      let distBetweenActive = Infinity;

      if (activeDropableContainer && activeDropableContainer.node.current) {
        const centerDroppable = centerOfRectangle(
          activeDropableContainer.node.current.getBoundingClientRect()
        );
        distBetweenActive = distanceBetween(centerDroppable, centerRect);
      }

      const itemSize = active.rect.current.initial?.width ?? 0;
      const threshold = itemSize + gap;

      if (distBetweenActive < threshold) {
        return previousCandidate.current;
      }

      for (const droppableContainer of droppableContainers) {
        const { id } = droppableContainer;
        const rect = droppableRects.get(id);

        if (rect) {
          const centerDroppable = centerOfRectangle(rect);
          const distBetween = distanceBetween(centerDroppable, centerRect);

          collisions.push({
            id,
            data: {
              droppableContainer,
              value: distBetween,
            },
          });
        }
      }

      collisions.sort(
        ({ data: { value: a } }, { data: { value: b } }) => a - b
      );

      previousCandidate.current = collisions;

      return previousCandidate.current;
    },
    [gap]
  );

  const onDragEnd = useCallback(() => {
    previousCandidate.current = [];
  }, []);

  return {
    collisionDetection,
    onDragEnd,
  };
}

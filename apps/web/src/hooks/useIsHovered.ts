import { useEffect, useRef, useState } from "react";

export function useIsHovered({ disabled = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (disabled) {
        return;
      }

      const rect = elementRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const isHovered =
        e.x > rect.x &&
        e.x < rect.x + rect.width &&
        e.y > rect.y &&
        e.y < rect.y + rect.height;

      setIsHovered(isHovered);
    };

    if (!disabled) {
      document.addEventListener("mousemove", onMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      setIsHovered(false);
    };
  }, [disabled]);

  return { isHovered, ref: elementRef };
}

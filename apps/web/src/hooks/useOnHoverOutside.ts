import { useEffect, useRef } from "react";
import { useIsHovered } from "./useIsHovered";

export function useOnHoverOutside(
  callback: () => void,
  {
    disabled = false,
    delay = 0,
  }: Partial<{
    disabled: boolean;
    delay: number;
  }> = { disabled: false, delay: 0 }
) {
  const { isHovered, ref } = useIsHovered({ disabled });
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isHovered && !disabled) {
      if (delay === 0) {
        callback();
      } else {
        timeout.current = setTimeout(callback, delay);
      }
    }

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      timeout.current = null;
    };
  }, [isHovered, callback, disabled, delay]);

  return { ref, isOutside: !isHovered && !disabled };
}

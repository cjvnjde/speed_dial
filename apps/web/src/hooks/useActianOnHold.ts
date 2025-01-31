import { useEffect } from "react";

type Options = Partial<{
  delay: number;
  threshold: number;
  disabled: boolean;
}>;

function createActionOnHold(
  callback: () => void,
  { disabled = false, delay = 0, threshold = 10 }: Options = {
    disabled: false,
    delay: 0,
    threshold: 10,
  },
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let initialX = 0;
  let initialY = 0;

  const handleMouseMove = (e: MouseEvent) => {
    if (disabled) {
      return;
    }

    const distance = Math.sqrt((initialX - e.x) ** 2 + (initialY - e.y) ** 2);

    if (distance > threshold) {
      initialX = e.x;
      initialY = e.y;

      if (timeout !== null) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(callback, delay);
    }
  };

  if (!disabled) {
    document.addEventListener("mousemove", handleMouseMove);
  }

  return () => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = null;
    document.removeEventListener("mousemove", handleMouseMove);
  };
}

export function useActionOnHold(
  callback: () => void,
  {
    disabled = false,
    delay = 0,
  }: Partial<{
    disabled: boolean;
    delay: number;
  }> = { disabled: false, delay: 0 },
) {
  useEffect(() => {
    return createActionOnHold(callback, { disabled, delay });
  }, [disabled, delay, callback]);
}

import { useEffect, useRef, useState } from "react";

export function useOpenDelay(value: boolean, { delay = 300 } = { delay: 300 }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, delay);
    } else {
      setIsOpen(false);
    }
  }, [value, delay]);

  return isOpen;
}

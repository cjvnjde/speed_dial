import { MutableRefObject, RefCallback, useCallback, useRef } from "react";

type Ref<T> = MutableRefObject<T> | ((instance: T | null) => void);

export function useMergeRefs<T>(
  ...refs: Array<Ref<T> | null | undefined>
): RefCallback<T> {
  const mergedRefs = useRef<Array<Ref<T> | null | undefined>>(refs);

  mergedRefs.current = refs;

  return useCallback((value: T | null) => {
    mergedRefs.current.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref) {
        (ref as MutableRefObject<T | null>).current = value;
      }
    });
  }, []);
}

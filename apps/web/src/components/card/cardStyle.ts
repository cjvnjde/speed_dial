import { tv } from "tailwind-variants";

export const cardStyle = tv({
  base: "p-2 rounded transition bg-card-background rounded-sm w-full h-full flex items-center justify-center",
  variants: {
    dragging: {
      true: "cursor-grabbing",
      false: "cursor-grab",
    },
    hovered: {
      true: "border border-slate-500",
      false: null,
    },
    overlay: {
      true: null,
      false: null,
    },
  },
  compoundVariants: [
    {
      dragging: true,
      overlay: false,
      className: "opacity-30",
    },
  ],
  defaultVariants: {
    dragging: false,
    hovered: false,
    overlay: false,
  },
});

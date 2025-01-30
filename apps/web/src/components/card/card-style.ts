import { tv } from "tailwind-variants";

export const cardStyle = tv({
  base: "p-2 rounded-card transition w-full h-full text-card-text flex items-center justify-center shadow-sm border border-card-border",
  variants: {
    dragging: {
      true: "cursor-grabbing",
      false: "cursor-pointer hover:border-card-border-hover",
    },
    hovered: {
      true: "border border-slate-500",
      false: null,
    },
    overlay: {
      true: null,
      false: null,
    },
    type: {
      folder: "bg-folder-background",
      bookmark: "bg-bookmark-background",
      new: "bg-bookmark-background opacity-30",
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
    type: "bookmark",
  },
});

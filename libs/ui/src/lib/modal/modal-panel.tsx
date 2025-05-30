import { DialogPanel } from "@headlessui/react";
import { PropsWithChildren, Ref } from "react";
import { tv, VariantProps } from "tailwind-variants";

const modalPanelStyle = tv({
  base: "p-4 w-full border border-popup-border rounded-lg bg-popup-background duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 my-6 mx-12",
  variants: {
    size: {
      md: "max-w-[424px]",
      lg: "max-w-[1200px]",
      full: "max-w-full",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type ModalPanelProps = PropsWithChildren<{
  ref?: Ref<HTMLElement>;
}> &
  VariantProps<typeof modalPanelStyle>;

export const ModalPanel = ({ children, size, ref }: ModalPanelProps) => {
  return (
    <DialogPanel ref={ref} transition className={modalPanelStyle({ size })}>
      {children}
    </DialogPanel>
  );
};

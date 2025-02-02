import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { PropsWithChildren } from "react";
import { useOnHoverOutside } from "../hooks/useOnHoverOutside";
import { tv } from "tailwind-variants";

type OverlayPopupProps = PropsWithChildren<{
  isOpen: boolean;
  isActive?: boolean;
  onClose: () => void;
}>;

const ovelayPopupStyle = tv({
  slots: {
    container: "relative z-50",
    backdrop:
      "fixed inset-0 transition ease-out duration-300 data-[closed]:opacity-0",
    panel:
      "mx-20 max-w-[1000px] w-full  border border-popup-border rounded-lg space-y-4 bg-popup-background p-4 duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0",
  },
  variants: {
    outside: {
      true: {
        backdrop: "bg-backdrop-background",
      },
      false: {
        backdrop: "bg-backdrop-background backdrop-blur-sm",
      },
    },
  },
});

export const OverlayPopup = ({
  isOpen = false,
  isActive = false,
  onClose,
  children,
}: OverlayPopupProps) => {
  const isEnabled = isOpen && isActive;
  const { ref: elementRef, isOutside } = useOnHoverOutside(onClose, {
    disabled: !isEnabled,
    delay: 1000,
  });

  const { container, backdrop, panel } = ovelayPopupStyle({
    outside: isOutside && isEnabled,
  });

  return (
    <Dialog open={isOpen} onClose={onClose} className={container()}>
      <DialogBackdrop transition className={backdrop()} />
      <div className="fixed inset-0  overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel transition ref={elementRef} className={panel()}>
            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

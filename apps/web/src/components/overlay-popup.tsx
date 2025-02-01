import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { PropsWithChildren } from "react";
import { useOnHoverOutside } from "../hooks/useOnHoverOutside";

type OverlayPopupProps = PropsWithChildren<{
  isOpen: boolean;
  isActive?: boolean;
  onClose: () => void;
}>;

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

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className={
          "fixed inset-0 transition ease-out duration-300 data-[closed]:opacity-0 " +
          (isOutside && isEnabled ? "bg-black/50" : "bg-black/30")
        }
      />
      <div className="fixed inset-0 w-screen overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel
            transition
            ref={elementRef}
            className="mx-20 w-full rounded-lg space-y-4 bg-popup-background p-12 duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

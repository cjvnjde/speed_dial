import { Dialog, DialogBackdrop } from "@headlessui/react";
import { PropsWithChildren } from "react";
import { tv } from "tailwind-variants";

const modalStyle = tv({
  slots: {
    container: "relative z-50",
    backdrop:
      "fixed inset-0 transition ease-out duration-300 data-[closed]:opacity-0 bg-backdrop-background backdrop-blur-sm",
  },
});

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
}>;

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const { container, backdrop } = modalStyle();

  return (
    <Dialog open={isOpen} onClose={onClose} className={container()}>
      <DialogBackdrop transition className={backdrop()} />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          {children}
        </div>
      </div>
    </Dialog>
  );
};

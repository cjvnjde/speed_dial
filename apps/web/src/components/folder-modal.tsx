import { PropsWithChildren } from "react";
import { useOnHoverOutside } from "../hooks/useOnHoverOutside";
import { Modal, ModalPanel } from "@libs/ui";

type FolderModalProps = PropsWithChildren<{
  isOpen: boolean;
  isActive?: boolean;
  onClose: () => void;
}>;

export const FolderModal = ({
  isOpen = false,
  isActive = false,
  onClose,
  children,
}: FolderModalProps) => {
  const isEnabled = isOpen && isActive;
  const { ref: elementRef } = useOnHoverOutside(onClose, {
    disabled: !isEnabled,
    delay: 1000,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalPanel ref={elementRef} size="full">
        {children}
      </ModalPanel>
    </Modal>
  );
};

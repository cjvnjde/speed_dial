import { cardStyle } from "./card/card-style";
import { IconPlus } from "@tabler/icons-react";
import { OverlayPopup } from "./overlay-popup";
import { useState } from "react";

type CardAddNewProps = {
  parentId: string | number;
};

export const CardAddNew = ({ parentId }: CardAddNewProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cardStyle({ type: "new" })}
      >
        <IconPlus size={48} />
      </button>
      <OverlayPopup isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <span className="text-white">{parentId}</span>
      </OverlayPopup>
    </>
  );
};

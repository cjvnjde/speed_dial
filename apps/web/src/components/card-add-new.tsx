import { cardStyle } from "./card/card-style";
import { IconPlus } from "@tabler/icons-react";
import { OverlayPopup } from "./overlay-popup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { bookmarks, bookmarksState } from "../states/bookmarks";
import { Input } from "./input";
import { WithLabel } from "./with-label";
import { useSetAtom } from "jotai";

type CardAddNewProps = {
  parentId: string | number;
};

type AddNewForm = {
  title: string;
  url?: string;
  type: "bookmark" | "folder";
};

const AddNewPopup = ({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: AddNewForm) => void;
}) => {
  const { register, handleSubmit } = useForm<AddNewForm>();

  const onSubmit = handleSubmit((data: AddNewForm) => {
    onCreate(data);
    onClose();
  });

  return (
    <OverlayPopup isOpen={isOpen} onClose={onClose}>
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <WithLabel label="Title">
          <Input {...register("title", { required: true })} />
        </WithLabel>
        <WithLabel label="URL">
          <Input {...register("url")} />
        </WithLabel>
        <WithLabel label="Type">
          <select className="bg-white rounded p-2" {...register("type")}>
            <option value="bookmark">Bookmark</option>
            <option value="folder">Folder</option>
          </select>
        </WithLabel>
        <button
          className="bg-blue-500 px-4 py-2 rounded w-fit cursor-pointer"
          type="submit"
        >
          Add
        </button>
      </form>
    </OverlayPopup>
  );
};

export const CardAddNew = ({ parentId }: CardAddNewProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const setItems = useSetAtom(bookmarksState);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cardStyle({ type: "new" })}
      >
        <IconPlus size={48} />
      </button>
      <AddNewPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCreate={(data) => {
          bookmarks.create({
            parentId: String(parentId),
            title: data.title,
            url: data.url,
            type: data.type,
          });

          setItems(bookmarks.getTree());
        }}
      />
    </>
  );
};

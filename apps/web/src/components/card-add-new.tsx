import { cardStyle } from "./card";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { bookmarks, bookmarksState } from "../states/bookmarks";
import { useSetAtom } from "jotai";
import { WithLabel, Input, Modal, ModalPanel } from "@libs/ui";

type CardAddNewProps = {
  parentId: string | number;
};

type AddNewForm = {
  title: string;
  url?: string;
  type: "bookmark" | "folder";
};

const AddNewItemForm = ({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: AddNewForm) => void;
}) => {
  const { register, handleSubmit } = useForm<AddNewForm>();

  const onSubmit = handleSubmit((data: AddNewForm) => {
    onCreate(data);
    onClose();
  });
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <WithLabel label="Title">
        <Input {...register("title", { required: true })} />
      </WithLabel>
      <WithLabel label="URL">
        <Input {...register("url")} />
      </WithLabel>
      <WithLabel label="Type">
        <select
          className="bg-input-background boder border-input-border text-input-text rounded p-2"
          {...register("type")}
        >
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
  );
};

const AddNewModal = ({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: AddNewForm) => void;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalPanel>
        <AddNewItemForm onClose={onClose} onCreate={onCreate} />
      </ModalPanel>
    </Modal>
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
      <AddNewModal
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

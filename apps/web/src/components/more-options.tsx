import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { IconDotsVertical } from "@tabler/icons-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

type RowOptionsProps = {
  children: ReactNode;
  className?: string;
};

export const MoreOptions = ({ children, className }: RowOptionsProps) => {
  return (
    <div className={className}>
      <Menu>
        <MenuButton
          className="inline-flex items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-700 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
          onClick={(e) => e.stopPropagation()}
        >
          <IconDotsVertical className="size-4 fill-white/60" />
        </MenuButton>
        <MenuItems
          transition
          anchor="bottom end"
          className="w-52 origin-top-right rounded-xl border border-white/5 bg-white/5 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </MenuItems>
      </Menu>
    </div>
  );
};

type OptionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children?: ReactNode;
};

const Option = ({
  children = undefined,
  className = undefined,
  ...props
}: OptionProps) => {
  return (
    <MenuItem>
      <button
        className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10"
        {...props}
      >
        {children}
      </button>
    </MenuItem>
  );
};

MoreOptions.Option = Option;

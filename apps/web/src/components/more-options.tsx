import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { IconDotsVertical } from "@tabler/icons-react";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { tv } from "tailwind-variants";

const moreOptionsStyle = tv({
  slots: {
    button:
      "inline-flex transition items-center gap-2 rounded-md  py-1.5 px-1.5   text-options-text   cursor-pointer  data-[open]:bg-options-background  border border-transparent data-[open]:border-options-border  hover:border-options-border",
    items:
      "w-52 origin-top-right rounded-xl   bg-options-background p-1 text-sm/6 text-options-text transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0",
  },
});

type RowOptionsProps = {
  children: ReactNode;
  className?: string;
};

export const MoreOptions = ({ children, className }: RowOptionsProps) => {
  const { button, items } = moreOptionsStyle();

  return (
    <div className={className}>
      <Menu>
        <MenuButton className={button()} onClick={(e) => e.stopPropagation()}>
          <IconDotsVertical className="size-4" />
        </MenuButton>
        <MenuItems
          transition
          anchor="bottom end"
          className={items()}
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
        className="group cursor-pointer flex w-full items-center gap-2 rounded-lg py-1.5 px-1.5"
        {...props}
      >
        {children}
      </button>
    </MenuItem>
  );
};

MoreOptions.Option = Option;

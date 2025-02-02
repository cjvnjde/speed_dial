import { cloneElement, ReactElement, ReactNode, useId, type Ref } from "react";
import { tv } from "tailwind-variants";

export const labelStyle = tv({
  base: "mb-1 block text-sm font-medium text-white",
  variants: {
    required: {
      true: "required",
      false: "",
    },
  },
  defaultVariants: {
    required: false,
  },
});

type WithLabelProps<
  T extends { id?: string; disabled?: boolean } = {
    id?: string;
    disabled?: boolean;
  }
> = {
  label: ReactNode;
  labelClassName?: string;
  children: ReactElement<T>;
  required?: boolean;
  ref?: Ref<HTMLDivElement>;
};

export const WithLabel = ({
  children,
  label,
  labelClassName = undefined,
  required = false,
  ref = undefined,
}: WithLabelProps) => {
  const inputId = useId();
  const childrenWithId = cloneElement(children, { id: inputId });

  return (
    <div className="flex flex-col" ref={ref}>
      {label !== undefined && (
        <label
          htmlFor={inputId}
          className={labelStyle({ required, className: labelClassName })}
        >
          {label}
        </label>
      )}
      {childrenWithId}
    </div>
  );
};

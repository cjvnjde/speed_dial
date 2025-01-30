import { ReactElement, ReactNode } from "react";
import { tv } from "tailwind-variants";

const inputWrapperStyle = tv({
  base: "flex flex-row bg-input-background border-input-border items-center overflow-hidden rounded border px-2 gap-2 transition text-input-text",
  variants: {
    disabled: {
      true: null,
      false: null,
    },
    hasError: {
      true: null,
      false: null,
    },
  },
  defaultVariants: {
    disabled: false,
    hasError: false,
  },
  compoundVariants: [
    {
      hasError: false,
      className: "",
    },
    {
      hasError: true,
      className: "",
    },
  ],
});

type BaseInputWrapperProps<
  T extends { disabled?: boolean } = { disabled?: boolean }
> = {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
  hasError?: boolean;
  children: ReactElement<T>;
  disabled?: boolean;
};

export const InputWrapper = ({
  children,
  disabled = false,
  className = undefined,
  startIcon = null,
  endIcon = null,
  hasError = false,
}: BaseInputWrapperProps) => {
  const isDisabled: boolean = children.props.disabled || disabled;

  return (
    <label
      className={inputWrapperStyle({
        disabled: isDisabled,
        hasError: Boolean(hasError),
        className,
      })}
    >
      {startIcon}
      {children}
      {endIcon}
    </label>
  );
};

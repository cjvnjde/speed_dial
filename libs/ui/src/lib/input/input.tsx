import { Input as HUInput } from "@headlessui/react";
import { InputHTMLAttributes, ReactNode, type Ref } from "react";
import { tv } from "tailwind-variants";
import { InputWrapper } from "./input-wrapper";

export const inputStyle = tv({
  base: "block h-8 w-full border-0 bg-transparent text-sm outline-none !ring-0 autofill:bg-transparent",
  variants: {
    variant: {
      input: "px-0",
      textarea: "px-3 py-2",
    },
  },
  defaultVariants: {
    variant: "input",
  },
});

export type InputSizes = 10 | 8 | 7;
export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string;
  size?: InputSizes;
  ref?: Ref<HTMLInputElement>;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  hasError?: boolean;
};

export const Input = ({
  hasError,
  startIcon,
  endIcon,
  className,
  wrapperClassName,
  ref = undefined,
  ...props
}: InputProps) => {
  return (
    <InputWrapper startIcon={startIcon} endIcon={endIcon} hasError={hasError}>
      <HUInput
        ref={ref}
        className={inputStyle({
          className,
          variant: "input",
        })}
        {...props}
      />
    </InputWrapper>
  );
};

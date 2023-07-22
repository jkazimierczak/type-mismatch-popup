import { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { IconContext } from "react-icons";
import { ICON_18px } from "@/components/IconSizes";

type Variant = "text" | "solid" | "outlined";

interface ButtonPropsI extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const style = {
  common: "box-border rounded border px-4 py-2 font-medium leading-5 transition-colors",
  commonDisabled: "cursor-default border-dark-400 text-dark-200",
  solid: "bg-primary border-primary text-white",
  solidDisabled: "bg-dark-400",
  outlined: "border-opacity-70 border-primary text-primary hover:border-opacity-100",
  outlinedDisabled: "",
  text: "border-transparent text-primary",
  textDisabled: "border-transparent text-dark-200",
  fullWidth: "w-full",
};

export function Button({
  children,
  variant = "outlined",
  fullWidth,
  disabled,
  iconLeft,
  iconRight,
  ...props
}: ButtonPropsI) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx({
        [style.common]: true,
        [style.commonDisabled]: disabled,
        [style.fullWidth]: fullWidth,
        [style.solid]: variant === "solid" && !disabled,
        [style.solidDisabled]: variant === "solid" && disabled,
        [style.outlined]: variant === "outlined" && !disabled,
        [style.outlinedDisabled]: variant === "outlined" && disabled,
        [style.text]: variant === "text" && !disabled,
        [style.textDisabled]: variant === "text" && disabled,
      })}
    >
      <IconContext.Provider
        value={{
          size: ICON_18px,
          className: clsx({
            "fill-primary": variant !== "solid",
          }),
        }}
      >
        <span className={"flex items-center justify-center gap-2"}>
          {iconLeft && iconLeft}
          <p
            className={clsx({
              "w-full text-center": fullWidth,
            })}
          >
            {children}
          </p>
          {iconRight && iconRight}
        </span>
      </IconContext.Provider>
    </button>
  );
}

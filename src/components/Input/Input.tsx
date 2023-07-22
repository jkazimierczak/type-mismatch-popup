import { IconContext } from "react-icons";
import { ICON_18px } from "@/components/IconSizes";
import React, { forwardRef } from "react";
import { clsx } from "clsx";
import { ChangeHandler } from "react-hook-form";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onChange: ChangeHandler;
  onBlur: ChangeHandler;
  name: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  iconInBlock?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      onChange,
      onBlur,
      name,
      iconLeft,
      iconRight,
      iconInBlock,
      ...props
    }: InputProps,
    forwardedRef
  ) => {
    return (
      <label className="relative block">
        <span className="sr-only">Search</span>
        <input
          {...props}
          name={name}
          ref={forwardedRef}
          onChange={onChange}
          onBlur={onBlur}
          className={clsx(
            "placeholder:text-t-white-60 block w-full rounded bg-dark-700 py-2 pl-2.5 text-white placeholder:font-medium placeholder:antialiased focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm",
            {
              "pl-[38px]": iconLeft,
              "pl-[45px]": iconInBlock && iconLeft,
            }
          )}
        />
        <span
          className={clsx("absolute inset-y-0 flex items-center ", {
            "right-0 px-2.5": iconRight,
            "left-0 px-2.5": iconLeft,
            "bg-dark-500": iconInBlock,
            "rounded-l": iconInBlock && iconLeft,
            "rounded-r": iconInBlock && iconRight,
          })}
        >
          <IconContext.Provider
            value={{ size: ICON_18px, className: "fill-dark-300" }}
          >
            {iconLeft || iconRight}
          </IconContext.Provider>
        </span>
      </label>
    );
  }
);

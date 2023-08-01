import {
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
  forwardRef,
  useState,
} from "react";
import { IconContext } from "react-icons";
import { IoCheckbox, IoSquareOutline } from "react-icons/io5";

export interface CheckboxProps extends ComponentProps<"input"> {
  label?: string;
  iconChecked?: ReactNode;
  iconUnchecked?: ReactNode;
  iconSize?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      iconChecked = <IoCheckbox />,
      iconUnchecked = <IoSquareOutline />,
      iconSize,
      checked,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const [isChecked, setIsChecked] = useState(checked ? checked : false);

    function onChangeHandler(e: ChangeEvent<HTMLInputElement>) {
      setIsChecked(!isChecked);
      if (onChange) {
        onChange(e);
      }
    }

    return (
      <label>
        <input
          type="checkbox"
          className="hidden"
          ref={forwardedRef}
          checked={isChecked}
          onChange={onChangeHandler}
          {...props}
        />
        <IconContext.Provider value={{ size: iconSize }}>
          {isChecked ? iconChecked : iconUnchecked}
        </IconContext.Provider>
        {label}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

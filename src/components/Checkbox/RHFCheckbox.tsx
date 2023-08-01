import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from "react-hook-form";
import { type CheckboxProps, Checkbox } from "./Checkbox";

export type RHFCheckboxProps<T extends FieldValues> = CheckboxProps &
  UseControllerProps<T>;

export function RHFCheckbox<T extends FieldValues>(props: RHFCheckboxProps<T>) {
  const { name, control, value, ...rest } = props;
  const { field } = useController<T>({ name, control });

  return <Checkbox {...rest} {...field} checked={field.value} value={value} />;
}

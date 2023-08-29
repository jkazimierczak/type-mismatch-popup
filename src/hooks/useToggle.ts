import { useState } from "react";

export function useToggle(initialValue?: boolean) {
  const [value, setValue] = useState<boolean>(!!initialValue);

  function toggle() {
    setValue(!value);
  }

  return {
    value,
    toggle,
    setValue,
  };
}

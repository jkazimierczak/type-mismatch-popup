import { makeContentEditable } from "@/utils/makeContentEditable";
import { type ComponentProps, forwardRef } from "react";
import { Checkbox } from "@/components/Checkbox";

interface AnswerProps extends ComponentProps<"input"> {
  isEditable?: boolean;
  text: string;
}

export const MultipleChoice = forwardRef<HTMLInputElement, AnswerProps>(
  ({ isEditable, text, ...props }, forwardedRef) => {
    return (
      <div className="mb-2 flex items-center gap-2.5">
        <Checkbox iconSize={"1.5em"} {...props} ref={forwardedRef} />
        <p
          {...(isEditable ? makeContentEditable() : {})}
          className="w-full rounded bg-neutral-800 px-4 py-2.5"
        >
          {text}
        </p>
      </div>
    );
  }
);
MultipleChoice.displayName = "MultipleChoice";

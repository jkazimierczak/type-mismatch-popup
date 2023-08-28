import { type Control, useController } from "react-hook-form";
import { type QuestionLearnData } from "@/validators/question";
import { type ComponentProps, forwardRef, useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "@/components/ui/form";

interface MultipleChoiceProps extends ComponentProps<"div"> {
  answerIdx: number;
  control: Control<QuestionLearnData>;
}

export const MultipleChoice = forwardRef<HTMLDivElement, MultipleChoiceProps>(
  ({ answerIdx, control, ...props }, forwardedRef) => {
    const { field: answer } = useController({
      control,
      name: `answers.${answerIdx}.answer`,
    });
    const checkboxIdPrefix = useId();
    const checkboxId = `${checkboxIdPrefix}-isChecked`;

    return (
      <div {...props} ref={forwardedRef} className="mb-2">
        <div className="mb-1.5 flex items-center gap-2.5">
          <FormField
            control={control}
            name={`answers.${answerIdx}.isChecked`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    id={checkboxId}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <label
            htmlFor={checkboxId}
            className="w-full rounded border-none bg-neutral-800 px-2 py-1.5"
          >
            {answer.value}
          </label>
        </div>
      </div>
    );
  }
);
MultipleChoice.displayName = "MultipleChoice";

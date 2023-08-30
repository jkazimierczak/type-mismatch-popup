import { type Control, useController } from "react-hook-form";
import { type QuestionData } from "@/validators/question";
import { type ComponentProps, forwardRef, useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "@/components/ui/form";

interface MultipleChoiceEditableProps extends ComponentProps<"div"> {
  answerIdx: number;
  control: Control<QuestionData>;
}

export const MultipleChoiceEditable = forwardRef<
  HTMLDivElement,
  MultipleChoiceEditableProps
>(({ answerIdx, control, ...props }, forwardedRef) => {
  const {
    field: answer,
    formState: { errors },
  } = useController({
    control,
    name: `answers.${answerIdx}.answer`,
  });
  const checkboxIdPrefix = useId();
  const checkboxId = `${checkboxIdPrefix}-isCorrect`;

  return (
    <div {...props} ref={forwardedRef}>
      <div className="flex items-center gap-2.5">
        <FormField
          control={control}
          name={`answers.${answerIdx}.isCorrect`}
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

        <input
          {...answer}
          type="text"
          autoComplete="off"
          className="w-full rounded border-none bg-neutral-800 px-2 py-1.5"
        />
      </div>
      {errors.answers && (
        <p className="ml-[30px] text-red-500">
          {errors.answers[answerIdx]?.answer?.message}
        </p>
      )}
    </div>
  );
});
MultipleChoiceEditable.displayName = "MultipleChoiceEditable";

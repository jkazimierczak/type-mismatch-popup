import { type Control, useController } from "react-hook-form";
import { AnswerData, type QuestionLearnData } from "@/validators/question";
import { type ComponentProps, forwardRef, useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { clsx } from "clsx";

interface MultipleChoiceProps extends ComponentProps<"div"> {
  answerIdx: number;
  control: Control<QuestionLearnData>;
  answer: AnswerData;
  peekAnswers: boolean;
}

export const MultipleChoice = forwardRef<HTMLDivElement, MultipleChoiceProps>(
  ({ answerIdx, answer, peekAnswers, control, ...props }, forwardedRef) => {
    const {
      field: { value: isChecked },
    } = useController({
      control,
      name: `answers.${answerIdx}.isChecked`,
    });

    const checkboxIdPrefix = useId();
    const checkboxId = `${checkboxIdPrefix}-isChecked`;

    const isCorrectChecked = peekAnswers && answer.isCorrect && isChecked;
    const isCorrectUnchecked = peekAnswers && answer.isCorrect && !isChecked;
    const isIncorrectChecked = peekAnswers && !answer.isCorrect && isChecked;

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
                    className={clsx({
                      "data-[state=checked]:bg-green-400/70": isCorrectChecked,
                      "border-green-400/70": isCorrectUnchecked,
                      "data-[state=checked]:bg-red-400/70": isIncorrectChecked,
                    })}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <label
            htmlFor={checkboxId}
            className={clsx({
              "w-full rounded border border-neutral-800 bg-neutral-800 px-2 py-1.5 transition-all duration-100":
                true,
              "bg-green-400/70": isCorrectChecked,
              "!border-green-400/70 text-green-400/70": isCorrectUnchecked,
              "bg-red-400/70": isIncorrectChecked,
            })}
          >
            {answer.answer}
          </label>
        </div>
      </div>
    );
  }
);
MultipleChoice.displayName = "MultipleChoice";

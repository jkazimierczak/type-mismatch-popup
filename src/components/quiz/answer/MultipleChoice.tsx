import { type Control, useController } from "react-hook-form";
import { type QuestionData } from "@/validators/question";
import { MdDeleteOutline } from "react-icons/md";
import { IoAdd, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { type ComponentProps, forwardRef, useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";

interface MultipleChoiceProps extends ComponentProps<"div"> {
  isEditable?: boolean;
  isFocused?: boolean;
  answerIdx: number;
  control: Control<QuestionData>;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAppend?: () => void;
  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
}

export const MultipleChoice = forwardRef<HTMLDivElement, MultipleChoiceProps>(
  (
    {
      isEditable,
      isFocused,
      answerIdx,
      control,
      onDelete,
      onMoveUp,
      onMoveDown,
      disableMoveUp,
      disableMoveDown,
      onAppend,
      ...props
    },
    forwardedRef
  ) => {
    const {
      field: answer,
      formState: { errors },
    } = useController({
      control,
      name: `answers.${answerIdx}.answer`,
    });
    const checkboxId = useId();

    return (
      <div {...props} ref={forwardedRef} className="mb-2">
        <div className="mb-1.5 flex items-center gap-2.5">
          <FormField
            control={control}
            name={`answers.${answerIdx}.isCorrect`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {isEditable ? (
            <input
              {...answer}
              type="text"
              autoComplete="off"
              className="w-full rounded border-none bg-neutral-800 px-2 py-1.5"
            />
          ) : (
            <label
              htmlFor={`${checkboxId}-isCorrect`}
              className="w-full rounded border-none bg-neutral-800 px-2 py-1.5"
            >
              {answer.value}
            </label>
          )}
        </div>
        <div className="ml-[30px]">
          {isFocused && isEditable && (
            <div className="grid justify-center rounded border border-neutral-700 py-1">
              <div className="grid grid-cols-4 gap-5">
                <Button variant="transparent" size="min" onClick={onDelete}>
                  <MdDeleteOutline size={18} />
                </Button>
                <Button variant="transparent" size="min" onClick={onMoveUp}>
                  <IoChevronUp size={18} />
                </Button>
                <Button variant="transparent" size="min" onClick={onMoveDown}>
                  <IoChevronDown size={18} />
                </Button>
                <Button variant="transparent" size="min" onClick={onAppend}>
                  <IoAdd size={18} />
                </Button>
              </div>
            </div>
          )}
          {errors.answers && (
            <p className="text-red-500">
              {errors.answers[answerIdx]?.answer?.message}
            </p>
          )}
        </div>
      </div>
    );
  }
);
MultipleChoice.displayName = "MultipleChoice";

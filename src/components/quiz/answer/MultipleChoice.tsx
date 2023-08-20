import { RHFCheckbox } from "@/components/Checkbox";
import { type Control, useController } from "react-hook-form";
import { type QuestionData } from "@/validators/question";
import { MdDeleteOutline } from "react-icons/md";
import { IoAdd, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { type ComponentProps, forwardRef } from "react";
import { Button } from "@/components/ui/button";

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

    return (
      <div {...props} ref={forwardedRef} className="mb-2">
        <div className="mb-1 flex items-center gap-2.5">
          <RHFCheckbox
            name={`answers.${answerIdx}.isCorrect`}
            control={control}
            iconSize="1.5em"
            value={answerIdx}
          />
          <input
            {...answer}
            type="text"
            autoComplete="off"
            className="w-full rounded border-none bg-neutral-800 px-2 py-1.5"
          />
        </div>
        <div className="ml-[34px]">
          {isFocused && (
            <div className="grid justify-center rounded border border-neutral-700 py-1">
              <div className="grid grid-cols-4 gap-5">
                <Button variant="transparent" size="min">
                  <MdDeleteOutline size={18} onClick={onDelete} />
                </Button>
                <Button variant="transparent" size="min">
                  <IoChevronUp size={18} onClick={onMoveUp} />
                </Button>
                <Button variant="transparent" size="min">
                  <IoChevronDown size={18} onClick={onMoveDown} />
                </Button>
                <Button variant="transparent" size="min">
                  <IoAdd size={18} onClick={onAppend} />
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

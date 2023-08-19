import { RHFCheckbox } from "@/components/Checkbox";
import { type Control, useController } from "react-hook-form";
import { type QuestionData } from "@/validators/question";
import { MdDeleteOutline } from "react-icons/md";
import { IoAdd, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { IconContext } from "react-icons";
import { type ComponentProps, forwardRef } from "react";

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
            className="w-full rounded border-none bg-neutral-800"
          />
        </div>
        <div className="ml-[34px]">
          {isFocused && (
            <div className="grid justify-center rounded border border-neutral-700 py-1">
              <div className="grid grid-cols-4 gap-5">
                <IconContext.Provider value={{ size: "1.125em" }}>
                  <MdDeleteOutline onClick={onDelete} />
                  <IoChevronUp onClick={onMoveUp} />
                  <IoChevronDown onClick={onMoveDown} />
                  <IoAdd onClick={onAppend} />
                </IconContext.Provider>
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

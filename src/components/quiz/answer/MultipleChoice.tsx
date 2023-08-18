import { RHFCheckbox } from "@/components/Checkbox";
import { type Control, useController } from "react-hook-form";
import { type QuestionData } from "@/validators/question";
import { MdDeleteOutline } from "react-icons/md";

interface MultipleChoiceProps {
  isEditable?: boolean;
  answerIdx: number;
  control: Control<QuestionData>;
  onDelete?: () => void;
}

export function MultipleChoice({
  answerIdx,
  control,
  onDelete,
}: MultipleChoiceProps) {
  const {
    field: answer,
    formState: { errors },
  } = useController({
    control,
    name: `answers.${answerIdx}.answer`,
  });

  return (
    <div className="mb-2">
      <div className="mb-1 flex items-center gap-2.5">
        <RHFCheckbox
          name={`answers.${answerIdx}.isCorrect`}
          control={control}
          iconSize="1.5em"
          value={answerIdx}
        />
        <input
          type="text"
          className="w-full rounded border-none bg-neutral-800"
          {...answer}
        />
        <MdDeleteOutline size={24} onClick={onDelete} />
      </div>
      {errors.answers && (
        <p className="ml-[34px] text-red-500">
          {errors.answers[answerIdx]?.answer?.message}
        </p>
      )}
    </div>
  );
}

import { makeContentEditable } from "@/utils/makeContentEditable";
import { IoAdd, IoArrowBack, IoArrowForward } from "react-icons/io5";
import { useFieldArray, useForm } from "react-hook-form";
import { RHFCheckbox } from "@/components/Checkbox";
import { Button } from "@/components/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { type QuestionData, questionSchema } from "@/models/quiz";
import { useEffect } from "react";
import { DevTool } from "@hookform/devtools";
import type { usePagination } from "@/hooks/usePagination";
import { DotPulse, Ring } from "@uiball/loaders";
import { MdDeleteOutline } from "react-icons/md";

interface QuestionFormProps {
  formValues: QuestionData;
  onSubmit: (data: QuestionData) => void;
  pagination: ReturnType<typeof usePagination>;
  isLoading: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}

export function QuestionForm({
  formValues,
  onSubmit,
  pagination,
  isLoading,
  isDeleting,
  onDelete,
}: QuestionFormProps) {
  const {
    control,
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty, dirtyFields },
  } = useForm({
    resolver: zodResolver(questionSchema),
    mode: "onBlur",
    defaultValues: formValues,
  });
  const { fields: answers, append } = useFieldArray({
    control,
    name: "answers",
  });

  const hasTooFewAnswers = answers.length < 2;

  // Register contentEditable field
  useEffect(() => {
    register("question");
  }, [register]);

  // Reset form state and load new values
  useEffect(() => {
    reset(formValues);
  }, [formValues, pagination.page, reset]);

  useEffect(() => {
    if (isDirty) {
      console.log("dirty:", isDirty, dirtyFields);
    }
  }, [dirtyFields, isDirty, pagination.page]);

  return (
    <>
      <DevTool control={control} />

      <form
        className="mx-4 mt-5 flex flex-col"
        style={{ minHeight: "calc(100svh - 80px)" }}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-lg font-medium">
            Pytanie{" "}
            <span className="ml-1.5 lining-nums tabular-nums text-neutral-400">
              #{pagination.page + 1}
            </span>
          </p>
          {!pagination.isOverflow && (
            <div className="grid grid-cols-1 items-center justify-center gap-4 rounded bg-neutral-800 px-4 py-1">
              {!isDeleting ? (
                <MdDeleteOutline onClick={onDelete} />
              ) : (
                <Ring color="white" size={16} />
              )}
            </div>
          )}
        </div>
        <p
          {...makeContentEditable()}
          className="mb-1 w-full rounded-md border-none bg-neutral-800 px-1.5 py-2 text-center"
          onInput={(event) => {
            setValue("question", event.currentTarget.textContent ?? "", {
              shouldValidate: true,
            });
          }}
          onBlur={(event) =>
            setValue("question", event.currentTarget.textContent ?? "", {
              shouldValidate: true,
            })
          }
        >
          {formValues.question}
        </p>
        {errors.question && (
          <p className="text-red-500">{errors.question?.message}</p>
        )}

        <div className="mb-3 mt-5 flex justify-between">
          <p className="text-lg font-medium">Odpowiedzi</p>
        </div>

        <div className="flex flex-grow flex-col justify-between">
          <div>
            {answers.map((field, idx) => (
              <div key={field.id} className="mb-2">
                <div className="mb-1 flex items-center gap-2.5">
                  <RHFCheckbox
                    name={`answers.${idx}.isCorrect`}
                    control={control}
                    iconSize="1.5em"
                    value={idx}
                  />
                  <input
                    type="text"
                    {...register(`answers.${idx}.answer`)}
                    className="w-full rounded border-none bg-neutral-800"
                  />
                </div>
                {errors.answers && (
                  <p className="ml-[34px] text-red-500">
                    {errors.answers[idx]?.answer?.message}
                  </p>
                )}
              </div>
            ))}

            <div className="mb-3 ml-[34px]">
              <Button
                iconLeft={<IoAdd />}
                fullWidth
                onClick={() => {
                  append({ answer: "", isCorrect: false });
                }}
              >
                Dodaj odpowiedź
              </Button>
            </div>
          </div>

          <div className="mb-4">
            {hasTooFewAnswers && (
              <p className="mb-2 text-center text-neutral-600">
                Musisz dodać conajmniej 2 odpowiedzi.
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                iconLeft={<IoArrowBack />}
                onClick={pagination.previous}
                disabled={pagination.isFirstPage}
              >
                Poprzednie
              </Button>
              <Button
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={
                  pagination.isOverflow
                    ? handleSubmit(onSubmit)
                    : pagination.next
                }
                variant="solid"
                fullWidth
                disabled={hasTooFewAnswers || !isValid}
                iconRight={
                  isLoading ? null : pagination.isOverflow ? (
                    <IoAdd />
                  ) : (
                    <IoArrowForward />
                  )
                }
              >
                {isLoading ? (
                  <DotPulse color="white" size={24} />
                ) : pagination.isOverflow ? (
                  "Dodaj"
                ) : (
                  "Kolejne"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

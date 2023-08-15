import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getServerAuthSession } from "@/server/auth";
import { createAuthCallback } from "@/utils/callbackUrl";
import { SlottedNavbar } from "@/components/Navbar/SlottedNavbar";
import { api } from "@/utils/api";
import { type SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { type QuestionData, questionSchema } from "@/models/quiz/question";
import { usePagination } from "@/hooks/usePagination";
import { useEffect, useState } from "react";
import { Ring } from "@uiball/loaders";
import { DevTool } from "@hookform/devtools";
import { MdDeleteOutline } from "react-icons/md";
import { makeContentEditable } from "@/utils/makeContentEditable";
import { RHFCheckbox } from "@/components/Checkbox";
import { Button } from "@/components/Button";
import { IoAdd, IoArrowBack, IoArrowForward } from "react-icons/io5";
import { zodResolver } from "@hookform/resolvers/zod";

const defaultValues: QuestionData = {
  question: "Question",
  answers: [
    { answer: "A", isCorrect: false },
    { answer: "B", isCorrect: false },
  ],
};

export default function EditQuestions(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const utils = api.useContext();
  const [wasCreated, setWasCreated] = useState(false);

  const { data: questions, isFetching } = api.question.getAll.useQuery(
    {
      quizId: props.id,
    },
    {
      refetchOnWindowFocus: false,
    }
  );
  const { mutate: createQuestion, isLoading: isCreating } =
    api.question.create.useMutation({
      onSuccess: async () => {
        await utils.question.getAll.invalidate();
        setWasCreated(true);
      },
    });
  const { mutate: deleteQuestion, isLoading: isDeleting } =
    api.question.delete.useMutation({
      onSuccess: async () => {
        await utils.question.getAll.invalidate();
      },
    });

  const maxPage = questions?.length ?? 0;
  const pagination = usePagination(0, maxPage, true);
  const isNewQuestion = pagination.isOverflow;

  useEffect(() => {
    if (wasCreated) {
      pagination.next();
      setWasCreated(false);
    }
  }, [pagination, wasCreated]);

  const {
    control,
    register,
    setValue,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(questionSchema),
    mode: "onBlur",
    defaultValues,
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
    reset(defaultValues);
  }, [pagination.page, reset]);

  if (!questions) return null;

  const isLoading = isFetching || isCreating;

  const onSubmit: SubmitHandler<QuestionData> = (data) => {
    createQuestion({ quizId: props.id, data });
  };

  function onDelete() {
    if (questions) {
      deleteQuestion({ questionId: questions[pagination.page]?.id ?? "" });
    }
  }

  function addNewAnswerField() {
    append({ answer: "", isCorrect: false });
  }

  const handleNavigationForward = () => {
    // Question modified
    if (isDirty && !isNewQuestion) {
      // TODO: Add logic
      console.warn("TBD question:modified");
      pagination.next();
      return;
    }

    isNewQuestion ? onSubmit(getValues()) : pagination.next();
  };

  const handleNavigationBackward = pagination.previous;

  return (
    <>
      <SlottedNavbar
        title={"Edytor pytań"}
        rightSlot={
          <p className="lining-nums tabular-nums text-neutral-400">
            {isNewQuestion ? (
              isCreating ? (
                <Ring color="white" size={16} />
              ) : (
                "Nowe pytanie"
              )
            ) : (
              `Pytanie ${pagination.page + 1}/${questions.length ?? 1}`
            )}
          </p>
        }
      />

      <DevTool control={control} />

      <pre className="fixed left-0 top-0 z-10 bg-black p-2 text-sm">
        Dirty: {String(isDirty)}
        <br />
        {/*{JSON.stringify(getValues(), null, 2)}*/}
      </pre>

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
          {!isNewQuestion && (
            <div className="grid grid-cols-1 items-center justify-center gap-4 rounded bg-neutral-800 px-4 py-1">
              {!isDeleting ? (
                <MdDeleteOutline onClick={onDelete} />
              ) : (
                <Ring color="white" size={16} />
              )}
            </div>
          )}
        </div>
        {/* TODO: Make field dirty after content changes */}
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
          {defaultValues.question}
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
                onClick={addNewAnswerField}
                disabled={isLoading || isCreating}
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
                onClick={handleNavigationBackward}
                disabled={pagination.isFirstPage || isLoading || isDeleting}
              >
                Poprzednie
              </Button>
              <Button
                onClick={handleNavigationForward}
                variant="solid"
                fullWidth
                disabled={
                  hasTooFewAnswers || !isValid || isLoading || isDeleting
                }
                iconRight={isNewQuestion ? <IoAdd /> : <IoArrowForward />}
              >
                {isNewQuestion ? "Dodaj" : "Kolejne"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const id = ctx.params?.slug as string;
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: createAuthCallback(`quiz/${id}/edit`),
      },
    };
  }

  return {
    props: {
      id,
    },
  };
}

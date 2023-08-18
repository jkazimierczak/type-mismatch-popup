import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getServerAuthSession } from "@/server/auth";
import { createAuthCallback } from "@/utils/callbackUrl";
import { SlottedNavbar } from "@/components/Navbar/SlottedNavbar";
import { api } from "@/utils/api";
import { type SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import {
  type QuestionData,
  questionCreateSchema,
  type QuestionEditData,
  type AnswerReadData,
} from "@/models/quiz/question";
import { usePagination } from "@/hooks/usePagination";
import { useEffect, useState } from "react";
import { Ring } from "@uiball/loaders";
import { DevTool } from "@hookform/devtools";
import { MdDeleteOutline } from "react-icons/md";
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
  const [deletedAnswers, setDeletedAnswers] = useState<AnswerReadData["id"][]>(
    []
  );

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
  const { mutate: updateQuestion } = api.question.update.useMutation({
    onSuccess: async () => {
      await utils.question.getAll.invalidate();
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

  const currentQuestion = questions && questions[pagination.page];

  useEffect(() => {
    if (wasCreated) {
      pagination.next();
      setWasCreated(false);
    }
  }, [pagination, wasCreated]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid, isDirty, dirtyFields },
  } = useForm({
    resolver: zodResolver(questionCreateSchema),
    mode: "onBlur",
    defaultValues,
  });
  // TODO: Make naming consistent
  const {
    fields: answers,
    append,
    remove: removeAnswerField,
  } = useFieldArray({
    control,
    name: "answers",
    keyName: "rhf_id",
  });
  const hasTooFewAnswers = answers.length < 2;

  // Reset form state and load new values
  useEffect(() => {
    if (questions) {
      reset(currentQuestion ?? defaultValues);
      setDeletedAnswers([]);
    }
  }, [reset, questions, pagination.page]);

  if (!questions) return null;

  const isLoading = isFetching || isCreating;

  const onSubmit: SubmitHandler<QuestionData> = (data) => {
    createQuestion({ quizId: props.id, data });
  };

  function handleQuestionDelete() {
    if (questions) {
      deleteQuestion({ questionId: currentQuestion?.id ?? "" });
    }
  }

  function handleAnswerDelete(idx: number) {
    if (!currentQuestion) return;

    const answer = answers[idx];
    if (!answer) return;

    if ("id" in answer) {
      setDeletedAnswers([...deletedAnswers, answer.id as string]);
    }
    removeAnswerField(idx);
  }

  function addNewAnswerField() {
    append({ answer: "", isCorrect: false });
  }

  function getDirtyData() {
    if (!questions) return;

    const values = getValues();
    const newQuestion: QuestionEditData = {};

    if (dirtyFields.question) {
      newQuestion.question = values.question;
    }

    if (dirtyFields.answers) {
      newQuestion.answers = [];

      for (let i = 0; i < dirtyFields.answers.length; i++) {
        const item = values.answers[i];
        const itemDirtiness = dirtyFields.answers[i];

        if (!item || !itemDirtiness) continue;

        const isModified = Object.values(itemDirtiness).some((v) => v === true);
        if (isModified) {
          newQuestion.answers.push({
            ...currentQuestion?.answers[i],
            ...item,
          });
        }
      }
    }

    return newQuestion;
  }

  const isContentModified = isDirty && !isNewQuestion;

  function handleModifiedQuestion() {
    if (!currentQuestion) return;

    const dirtyData = getDirtyData();
    if (!dirtyData) return;

    const updateData = {
      id: currentQuestion.id,
      data: { ...dirtyData, answersToDelete: deletedAnswers },
    };

    // TODO: Fix typing
    updateQuestion(updateData);
  }

  function handleNavigationForward() {
    if (isContentModified) {
      handleModifiedQuestion();
      pagination.next();
    }

    isNewQuestion ? onSubmit(getValues()) : pagination.next();
  }

  function handleNavigationBackward() {
    if (isContentModified) {
      handleModifiedQuestion();
      pagination.previous();
    }

    pagination.previous();
  }

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
                <MdDeleteOutline onClick={handleQuestionDelete} />
              ) : (
                <Ring color="white" size={16} />
              )}
            </div>
          )}
        </div>
        <input
          type="text"
          {...register(`question`)}
          className="w-full rounded border-none bg-neutral-800"
        />
        {errors.question && (
          <p className="text-red-500">{errors.question?.message}</p>
        )}

        <div className="mb-3 mt-5 flex justify-between">
          <p className="text-lg font-medium">Odpowiedzi</p>
        </div>

        <div className="flex flex-grow flex-col justify-between">
          <div>
            {answers.map((field, idx) => (
              <div key={field.rhf_id} className="mb-2">
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
                  <MdDeleteOutline
                    size={24}
                    onClick={() => handleAnswerDelete(idx)}
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

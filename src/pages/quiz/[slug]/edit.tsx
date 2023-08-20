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
  questionCreateSchema,
  type QuestionData,
  type QuestionEditData,
} from "@/validators/question";
import { usePagination } from "@/hooks/usePagination";
import { useEffect, useState } from "react";
import { Ring } from "@uiball/loaders";
import { DevTool } from "@hookform/devtools";
import { MdDeleteOutline } from "react-icons/md";
import { Button } from "@/components/Button";
import {
  IoAdd,
  IoArrowBack,
  IoArrowForward,
  IoRefresh,
  IoSave,
} from "react-icons/io5";
import { zodResolver } from "@hookform/resolvers/zod";
import { MultipleChoice } from "@/components/quiz/answer";
import Head from "next/head";

// TODO: Replace with empty strings
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
  const [deletedAnswers, setDeletedAnswers] = useState<string[]>([]);

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
  const { mutate: updateQuestion, isLoading: isUpdating } =
    api.question.update.useMutation({
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
    append: appendAnswerField,
    move: moveAnswerField,
    remove: removeAnswerField,
  } = useFieldArray({
    control,
    name: "answers",
    keyName: "rhf_id",
  });
  const hasTooFewAnswers = answers.length < 2;

  const focusedAnswer = usePagination(0, answers.length);

  // Reset form state and load new values
  useEffect(() => {
    if (questions) {
      reset(currentQuestion ?? defaultValues);
      setDeletedAnswers([]);
      focusedAnswer.setPage(0);
    }
  }, [reset, questions, pagination.page, currentQuestion]);

  if (!questions) return null;

  const isLoading = isFetching || isCreating || isUpdating;

  const onSubmit: SubmitHandler<QuestionData> = (data) => {
    createQuestion({ quizId: props.id, data });
  };

  function handleQuestionReset() {
    reset(currentQuestion);
  }

  function handleQuestionSave() {
    handleModifiedQuestion();
  }

  function handleQuestionDelete() {
    if (questions) {
      deleteQuestion({ questionId: currentQuestion?.id ?? "" });
    }
  }

  function handleAnswerDelete(idx: number) {
    const answer = answers[idx];
    if (!answer) return;

    if ("id" in answer) {
      setDeletedAnswers([...deletedAnswers, answer.id as string]);
    }
    removeAnswerField(idx);
    focusedAnswer.setPage(focusedAnswer.page - 1);
  }

  function handleAnswerMoveUp(idx: number) {
    if (focusedAnswer.isFirstPage) return;

    moveAnswerField(idx, idx - 1);
    focusedAnswer.previous();
  }

  function handleAnswerMoveDown(idx: number) {
    if (focusedAnswer.isLastPage) return;

    moveAnswerField(idx, idx + 1);
    focusedAnswer.next();
  }

  function handleAnswerAppend(idx: number) {
    appendAnswerField({ answer: "", isCorrect: false });
  }

  function addNewAnswerField() {
    appendAnswerField({ answer: "", isCorrect: false });
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

    updateQuestion(updateData);
  }

  function handleNavigationForward() {
    isNewQuestion ? onSubmit(getValues()) : pagination.next();
  }

  function handleNavigationBackward() {
    pagination.previous();
  }

  return (
    <>
      <Head>
        <title>Edytor pytań | Quizcamp</title>
      </Head>

      <SlottedNavbar
        title={"Edytor pytań"}
        disableBack={isLoading}
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
          autoComplete="off"
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
              <MultipleChoice
                key={field.rhf_id}
                control={control}
                answerIdx={idx}
                onDelete={() => handleAnswerDelete(idx)}
                onMoveUp={() => handleAnswerMoveUp(idx)}
                onMoveDown={() => handleAnswerMoveDown(idx)}
                onAppend={() => handleAnswerAppend(idx)}
                disableMoveUp={focusedAnswer.isFirstPage}
                disableMoveDown={focusedAnswer.isLastPage}
                isFocused={focusedAnswer.page === idx}
                onFocus={() => focusedAnswer.setPage(idx)}
              />
            ))}

            <div className="mb-3 ml-[34px]">
              <Button
                iconLeft={<IoAdd />}
                fullWidth
                onClick={addNewAnswerField}
                disabled={isLoading || isCreating || isDeleting}
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
            {!isContentModified ? (
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
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  iconLeft={<IoRefresh />}
                  onClick={handleQuestionReset}
                  disabled={isLoading}
                >
                  Cofnij
                </Button>
                <Button
                  onClick={handleQuestionSave}
                  variant="solid"
                  fullWidth
                  disabled={isLoading}
                  iconRight={<IoSave />}
                >
                  Zapisz
                </Button>
              </div>
            )}
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

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
  type QuestionLearnData,
} from "@/validators/question";
import { usePagination } from "@/hooks/usePagination";
import { useEffect, useMemo } from "react";
import { DevTool } from "@hookform/devtools";
import { Button } from "@/components/ui/button";
import {
  IoArrowBack,
  IoArrowForward,
  IoCheckmarkDoneOutline,
} from "react-icons/io5";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { Form } from "@/components/ui/form";
import { MultipleChoice } from "@/components/Answer";
import { useToggle } from "@/hooks/useToggle";
import { clsx } from "clsx";

export default function QuizLearn(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { data: questionsRaw } = api.question.getAll.useQuery(
    {
      quizId: props.id,
    },
    {
      refetchOnWindowFocus: false,
    }
  );
  const questions = useMemo(() => {
    if (!questionsRaw) return;

    return questionsRaw?.map((question) => ({
      ...question,
      answers: question.answers.map((answer) => ({
        ...answer,
        isChecked: false,
      })),
    }));
  }, [questionsRaw]);
  const maxPage = questions?.length ?? 0;
  const pagination = usePagination(0, maxPage);
  const showVerificationResult = useToggle(false);

  const currentQuestion = questions && questions[pagination.page];

  const form = useForm<QuestionLearnData>({
    resolver: zodResolver(questionCreateSchema),
    mode: "onBlur",
    defaultValues: currentQuestion,
  });
  const { control, reset, getValues } = form;
  const { fields: answers } = useFieldArray({
    control,
    name: `answers`,
    keyName: "rhf_id",
  });

  const correctAnswers = answers.reduce(
    (acc, answer, idx) => {
      if (answer.isCorrect) {
        acc["total"]++;
        acc["checked"] += Number(getValues(`answers.${idx}.isChecked`));
      }
      return acc;
    },
    {
      total: 0,
      checked: 0,
    }
  );

  // Reset form state and load new values
  useEffect(() => {
    if (questions) {
      reset(currentQuestion);
      showVerificationResult.setValue(false);
    }
  }, [reset, questions, pagination.page, currentQuestion]);

  if (!questions) return null;

  const onSubmit: SubmitHandler<QuestionLearnData> = (data) => {
    console.warn("learn:submit", data);
  };

  function handleNavigationForward() {
    pagination.next();
  }

  function handleNavigationBackward() {
    pagination.previous();
  }

  function handleVerifyAnswers() {
    showVerificationResult.toggle();
  }

  return (
    <>
      <Head>
        <title>Tryb nauki | Quizcamp</title>
      </Head>

      <SlottedNavbar
        title={"Tryb nauki"}
        rightSlot={
          <p className="lining-nums tabular-nums text-neutral-400">
            {`Pytanie ${pagination.page + 1}/${questions.length ?? 1}`}
          </p>
        }
      />

      <DevTool control={control} />

      <Form {...form}>
        <form
          className="mx-4 mt-5 flex flex-col"
          style={{ minHeight: "calc(100svh - 80px)" }}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-lg font-medium">
              Pytanie{" "}
              <span className="ml-1.5 lining-nums tabular-nums text-neutral-400">
                #{pagination.page + 1}
              </span>
            </p>
            {/* TODO: Implement */}
            {/*<div className="grid grid-cols-2 items-center justify-center gap-4 rounded bg-neutral-800 px-4 py-1">*/}
            {/*  <Button variant="transparent" size="min">*/}
            {/*    <IoBookmarkOutline*/}
            {/*      onClick={() => console.warn("toolbar:bookmark")}*/}
            {/*    />*/}
            {/*  </Button>*/}
            {/*  <Button variant="transparent" size="min">*/}
            {/*    <IoGridOutline onClick={() => console.warn("toolbar:grid")} />*/}
            {/*  </Button>*/}
            {/*</div>*/}
          </div>
          <p className="w-full rounded border-none p-2 text-center font-medium">
            {form.getValues("question")}
          </p>

          <div className="mb-3 mt-3 flex justify-between">
            <p className="text-lg font-medium">Odpowiedzi</p>
            {showVerificationResult.value && (
              <span
                className={clsx({
                  "flex items-center gap-2 tabular-nums transition-colors":
                    true,
                  "text-green-400":
                    correctAnswers.checked === correctAnswers.total,
                })}
              >
                {correctAnswers.checked}/{correctAnswers.total}
              </span>
            )}
          </div>

          <div className="flex flex-grow flex-col justify-between">
            <div>
              {answers.map((field, idx) => (
                <MultipleChoice
                  key={field.rhf_id}
                  control={control}
                  answerIdx={idx}
                  answer={{
                    answer: answers[idx]!.answer,
                    isCorrect: answers[idx]!.isCorrect,
                  }}
                  peekAnswers={showVerificationResult.value}
                />
              ))}
            </div>

            <div className="mb-4">
              <div className="flex gap-2">
                <Button
                  className="w-2/3"
                  variant="outline"
                  onClick={handleNavigationBackward}
                  disabled={pagination.isFirstPage}
                >
                  <IoArrowBack />
                </Button>
                <Button variant="outline" onClick={handleVerifyAnswers}>
                  <IoCheckmarkDoneOutline className="mr-2" /> Sprawdź
                </Button>
                <Button
                  className="w-2/3"
                  variant="outline"
                  onClick={handleNavigationForward}
                  disabled={pagination.isLastPage}
                >
                  <IoArrowForward />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const id = ctx.params?.slug as string;
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: createAuthCallback(`quiz/${id}/learn`),
      },
    };
  }

  return {
    props: {
      id,
    },
  };
}

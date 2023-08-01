import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getServerAuthSession } from "@/server/auth";
import { createAuthCallback } from "@/utils/callbackUrl";
import { SlottedNavbar } from "@/components/Navbar/SlottedNavbar";
import { api } from "@/utils/api";
import { type SubmitHandler } from "react-hook-form";
import { type QuestionData } from "@/models/quiz/question";
import { QuestionForm } from "@/features/quizEditor/QuestionForm";
import { usePagination } from "@/hooks/usePagination";
import { useEffect, useState } from "react";

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
  const { mutate: createQuestion, isLoading } = api.question.create.useMutation(
    {
      onSuccess: async () => {
        await utils.question.getAll.invalidate();
        setWasCreated(true);
      },
    }
  );
  const { mutate: deleteQuestion, isLoading: isDeleting } =
    api.question.delete.useMutation({
      onSuccess: async () => {
        await utils.question.getAll.invalidate();
      },
    });

  const maxPage = questions?.length ?? 0;
  const pagination = usePagination(0, maxPage, true);

  useEffect(() => {
    if (wasCreated) {
      pagination.next();
      setWasCreated(false);
    }
  }, [pagination, wasCreated]);

  if (!questions) return null;

  const onSubmit: SubmitHandler<QuestionData> = (data) => {
    createQuestion({ quizId: props.id, data });
  };

  function onDelete() {
    if (questions) {
      deleteQuestion({ questionId: questions[pagination.page]?.id ?? "" });
    }
  }

  return (
    <>
      <SlottedNavbar
        title={"Edytor pytań"}
        rightSlot={
          <p className="lining-nums tabular-nums text-neutral-400">
            {pagination.isOverflow
              ? `Nowe pytanie`
              : `Pytanie ${pagination.page + 1}/${questions.length ?? 1}`}
          </p>
        }
      />

      <QuestionForm
        formValues={questions[pagination.page] ?? defaultValues}
        pagination={pagination}
        onSubmit={onSubmit}
        isLoading={isFetching || isLoading}
        isDeleting={isDeleting}
        onDelete={onDelete}
      />
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

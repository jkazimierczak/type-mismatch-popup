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
  question: "",
  answers: [{ answer: "", isCorrect: false }],
};

export default function EditQuestions(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const utils = api.useContext();
  const [wasMutated, setWasMutated] = useState(false);

  const { data: questions, isFetching } = api.question.getAll.useQuery(
    {
      quizId: props.id,
    },
    {
      refetchOnWindowFocus: false,
    }
  );
  const { mutate, isLoading } = api.question.create.useMutation({
    onSuccess: async () => {
      await utils.question.getAll.invalidate();
      setWasMutated(true);
    },
  });

  const maxPage = questions?.length ?? 0;
  const pagination = usePagination(0, maxPage, true);

  useEffect(() => {
    if (wasMutated) {
      pagination.next();
      setWasMutated(false);
    }
  }, [pagination, wasMutated]);

  if (!questions) return null;

  const onSubmit: SubmitHandler<QuestionData> = (data) => {
    mutate({ quizId: props.id, data });
  };

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

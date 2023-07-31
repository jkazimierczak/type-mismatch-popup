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

const defaultValues: QuestionData = {
  question: "",
  answers: [{ answer: "", isCorrect: true }],
};

export default function EditQuestions(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { mutate } = api.question.create.useMutation();
  const { data: questions } = api.question.getAll.useQuery({
    quizId: props.id,
  });

  const pagination = usePagination(1, questions?.length ?? 0, true);

  if (!questions) return null;

  const onSubmit: SubmitHandler<QuestionData> = (data) => {
    mutate({ quizId: props.id, data });
  };

  return (
    <>
      <SlottedNavbar
        title={"Edytor pytań"}
        rightSlot={
          <p className="text-neutral-400">
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

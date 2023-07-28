import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getServerAuthSession } from "@/server/auth";
import { createAuthCallback } from "@/utils/callbackUrl";
import { useEffect } from "react";
import { SlottedNavbar } from "@/components/Navbar/SlottedNavbar";
import { api } from "@/utils/api";
import { IoAdd, IoChevronDown, IoEllipseOutline } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { makeContentEditable } from "@/utils/makeContentEditable";
import { Button } from "@/components/Button";
import { MultipleChoice } from "@/components/quiz/answer";
import { NewQuestionData, questionSchema } from "@/models/quiz/question";
import { zodResolver } from "@hookform/resolvers/zod";

const defaultValues: NewQuestionData = {
  question: "",
  answers: [{ answer: "", isCorrect: true }],
};

export default function EditQuestions(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { data: quiz } = api.quiz.byId.useQuery({
    quizId: props.id,
  });
  const { control, register, setValue } = useForm({
    resolver: zodResolver(questionSchema),
    mode: "all",
    defaultValues,
  });

  useEffect(() => {
    register("question");
  }, [register]);

  if (!quiz) return null;

  return (
    <div>
      <DevTool control={control} />
      <SlottedNavbar
        title={"Edytor pytań"}
        rightSlot={
          <p className="text-neutral-400">
            Pytanie 1/{quiz.questions.length + 1}
          </p>
        }
      />
      <main className="mx-4 mt-5">
        <p className="mb-3 text-lg font-medium">
          Pytanie <span className="ml-1.5 text-neutral-400">#1</span>
        </p>
        <p
          {...makeContentEditable()}
          className="w-full rounded-md border-none bg-neutral-800 px-1.5 py-2 text-center"
          onInput={(event) => {
            setValue("question", event.currentTarget.textContent ?? "", {
              shouldValidate: true,
            });
          }}
        >
          Przykładowe pytanie
        </p>

        <div className="mb-3 mt-5 flex justify-between">
          <p className="text-lg font-medium">Odpowiedzi</p>
          <div className="flex max-w-fit items-center gap-1 rounded bg-neutral-800 px-1.5 py-0.5">
            <p className="text-sm leading-3">Wielokrotny wybór</p>
            <span className="mt-px">
              <IoChevronDown size={12} />
            </span>
          </div>
        </div>

        <MultipleChoice text="Przykładowa odpowiedź" isEditable />

        <div className="flex items-center gap-2.5 pb-2">
          <IoEllipseOutline
            size={24}
            className="invisible shrink-0 text-neutral-700"
          />
          <Button iconLeft={<IoAdd />} fullWidth>
            Dodaj odpowiedź
          </Button>
        </div>
      </main>
    </div>
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

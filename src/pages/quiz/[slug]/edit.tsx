import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getServerAuthSession } from "@/server/auth";
import { createAuthCallback } from "@/utils/callbackUrl";
import { useEffect } from "react";
import { SlottedNavbar } from "@/components/Navbar/SlottedNavbar";
import { api } from "@/utils/api";
import { IoAdd, IoArrowForward, IoChevronDown } from "react-icons/io5";
import {
  Controller,
  type SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { makeContentEditable } from "@/utils/makeContentEditable";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import { type QuestionData, questionSchema } from "@/models/quiz/question";
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
  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(questionSchema),
    mode: "all",
    defaultValues,
  });
  const { fields, append } = useFieldArray({
    control,
    name: "answers",
  });
  const hasTooFewAnswers = fields.length < 2;

  useEffect(() => {
    register("question");
  }, [register]);

  const onSubmit: SubmitHandler<QuestionData> = (data) => {
    console.log(data);
  };

  if (!quiz) return null;

  return (
    <>
      <DevTool control={control} />
      <SlottedNavbar
        title={"Edytor pytań"}
        rightSlot={
          <p className="text-neutral-400">
            Pytanie 1/{quiz.questions.length + 1}
          </p>
        }
      />
      <form
        className="mx-4 mt-5 flex flex-col"
        style={{ minHeight: "calc(100svh - 80px)" }}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
      >
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
          {defaultValues.question}
        </p>

        <div className="mb-3 mt-5 flex justify-between">
          <p className="text-lg font-medium">Odpowiedzi</p>
          <div className="flex max-w-fit items-center gap-1 rounded bg-neutral-800 px-1.5 py-0.5">
            <p className="text-sm leading-3">Jednokrotny wybór</p>
            <span className="mt-px">
              <IoChevronDown size={12} />
            </span>
          </div>
        </div>

        <div className="flex flex-grow flex-col justify-between">
          <div>
            {fields.map((field, idx) => (
              <div key={field.id} className="mb-2">
                <div className="mb-1 flex items-center gap-2.5">
                  <Controller
                    name={`answers.${idx}.isCorrect`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        iconSize="1.5em"
                        {...field}
                        checked={field.value}
                        value={idx}
                      />
                    )}
                  />
                  <input
                    type="text"
                    {...register(`answers.${idx}.answer`)}
                    className="w-full rounded border-none bg-neutral-800"
                  />
                </div>
                {errors.answers && (
                  <p className="ml-8 text-red-500">
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
            <Button
              type="submit"
              variant="solid"
              fullWidth
              disabled={hasTooFewAnswers || !isValid}
              iconRight={<IoArrowForward />}
            >
              Dodaj kolejne pytanie
            </Button>
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

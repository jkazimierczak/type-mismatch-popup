import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/utils/api";
import { createAuthCallback } from "@/utils/callbackUrl";
import {
  IoAdd,
  IoAlbumsOutline,
  IoBook,
  IoGolf,
  IoPencil,
} from "react-icons/io5";
import { Button } from "@/components/Button";
import { useRouter } from "next/router";
import Head from "next/head";
import { ssrInit } from "@/utils/ssr";
import { SlottedNavbar } from "@/components/Navbar/SlottedNavbar";
import { declensionQuestions } from "@/utils/declension";

export default function QuizPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();
  const { data: quiz } = api.quiz.byId.useQuery({
    quizId: props.id,
  });

  if (!quiz) return null;

  const quizIsEmpty = quiz.questions.length === 0;

  return (
    <>
      <Head>
        <title>{quiz.name} | Quizcamp</title>
      </Head>

      <SlottedNavbar title="Quiz" />

      <div className="mx-5 mt-5 text-white">
        <div className="mb-5 rounded-md border-2 border-neutral-700 p-3">
          <p className="mb-3 text-right">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <IoAlbumsOutline size={18} />
              {declensionQuestions(quiz.questions.length)}
            </span>
          </p>
          <h1 className="mb-3 text-xl font-bold">{quiz.name}</h1>
          <p className="flex items-center gap-2.5 text-neutral-300">
            <img
              className="h-8 w-8 rounded-full"
              src={quiz.author.image ?? undefined}
              alt={`${quiz.author.name ?? ""} profile image`}
            />
            {quiz.author.name}
          </p>
        </div>

        {quizIsEmpty && (
          <>
            <div className="mb-4 text-center text-neutral-400">
              <p>Są jakieś pytania? Jak zawsze - nie ma.</p>
              <p>Warto jednak dodać chociaż jedno.</p>
            </div>

            <Button
              fullWidth
              variant="solid"
              iconRight={<IoAdd />}
              onClick={() => void router.push(`./${props.id}/edit`)}
            >
              {quizIsEmpty ? "Dodaj nowe pytanie" : "Edytuj pytania"}
            </Button>
          </>
        )}

        {!quizIsEmpty && (
          <>
            <div className="mb-5 grid gap-2">
              <Button
                variant="solid"
                fullWidth
                iconLeft={<IoBook />}
                onClick={() => void router.push(`./${props.id}/learn`)}
              >
                Tryb nauki
              </Button>
              <Button
                variant="solid"
                fullWidth
                iconLeft={<IoGolf />}
                onClick={() => void router.push(`./${props.id}/test`)}
                disabled
              >
                Tryb testu
              </Button>
            </div>

            <hr className="mb-2 border-dark-400" />

            <Button
              fullWidth
              variant="solid"
              iconLeft={quizIsEmpty ? <IoAdd /> : <IoPencil />}
              onClick={() => void router.push(`./${props.id}/edit`)}
            >
              {quizIsEmpty ? "Dodaj nowe pytanie" : "Edytuj pytania"}
            </Button>
          </>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const id = ctx.params?.slug as string;
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: createAuthCallback(`quiz/${id}`),
      },
    };
  }

  const ssr = await ssrInit(ctx);
  await ssr.quiz.byId.prefetch({ quizId: id });

  return {
    props: {
      trpcState: ssr.dehydrate(),
      id,
    },
  };
}

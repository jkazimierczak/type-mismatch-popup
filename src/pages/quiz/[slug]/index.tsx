import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@/server/api/root";
import superjson from "superjson";
import { prisma } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/utils/api";
import { createAuthCallback } from "@/utils/callbackUrl";
import { IoAdd, IoAlbumsOutline } from "react-icons/io5";
import { Button } from "@/components/Button";
import { useRouter } from "next/router";
import Head from "next/head";

export default function QuizPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();
  const { data: quiz } = api.quiz.byId.useQuery({
    quizId: props.id,
  });

  if (!quiz) return null;

  return (
    <div className="mx-5 mt-5 text-white">
      <Head>
        <title>{quiz.name} | Quizcamp</title>
      </Head>
      <div className="rounded-md border-2 border-neutral-700 p-3">
        <p className="mb-3 text-right">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <IoAlbumsOutline size={18} /> {quiz.questions.length || "Brak"}{" "}
            pytań
          </span>
        </p>
        <h1 className="mb-3 text-xl font-bold">{quiz.name}</h1>
        <p className="flex items-center gap-2.5 text-neutral-300">
          <img
            className="h-8 w-8 rounded-full"
            src={quiz.author.image ?? undefined}
            alt={`${quiz.author.name ?? ""} profile image`}
          />{" "}
          {quiz.author.name}
        </p>
      </div>

      <div className="mb-4 mt-5 text-center text-neutral-400">
        <p>Są jakieś pytania? Jak zawsze - nie ma.</p>
        <p>Warto jednak dodać chociaż jedno.</p>
      </div>

      <Button
        fullWidth
        variant="solid"
        iconRight={<IoAdd />}
        onClick={() => void router.push(`./${props.id}/edit`)}
      >
        Dodaj nowe pytanie
      </Button>
    </div>
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

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, session },
    transformer: superjson,
  });

  await helpers.quiz.byId.prefetch({ quizId: id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
}

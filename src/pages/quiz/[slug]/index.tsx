import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@/server/api/root";
import superjson from "superjson";
import { prisma } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";
import { api, getBaseUrl } from "@/utils/api";

export default function QuizPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { data } = api.quiz.byId.useQuery({
    quizId: props.id,
  });

  return (
    <div>
      <p>{JSON.stringify(props.id, null, 4)}</p>
      <hr />
      <p>{JSON.stringify(data, null, 4)}</p>
    </div>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const id = ctx.params?.slug as string;
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: `/api/auth/signin?callbackUrl=${getBaseUrl()}/quiz/${id}`,
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

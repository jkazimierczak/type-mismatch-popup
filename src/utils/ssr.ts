import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import superjson from "superjson";
import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "@/server/auth";

export async function ssrInit(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  return createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, session },
    transformer: superjson,
  });
}

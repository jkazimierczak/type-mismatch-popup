import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { quizSchema } from "src/validators";
import { nanoid } from "nanoid";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";
import { QUIZ_NOT_FOUND } from "@/server/api/errors";

export const quizRouter = createTRPCRouter({
  create: protectedProcedure.input(quizSchema).mutation(({ input, ctx }) => {
    return ctx.prisma.quiz.create({
      data: {
        publicId: nanoid(12),
        name: input.quizName,
        visibility: input.visibility,
        authorId: ctx.session.user.id,
      },
    });
  }),

  byId: publicProcedure
    .input(
      z.object({
        quizId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const quiz = await prisma.quiz.findUnique({
        include: {
          author: true,
          questions: true,
        },
        where: {
          publicId: input.quizId,
        },
      });

      if (!quiz) {
        throw QUIZ_NOT_FOUND;
      }

      console.log(quiz.authorId, ctx.session?.user.id);

      if (
        quiz.visibility === "PRIVATE" &&
        quiz.authorId !== ctx.session?.user.id
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have access to this quiz.",
        });
      }

      return quiz;
    }),
});

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { newQuizSchema } from "@/models/quiz";
import { nanoid } from "nanoid";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const quizRouter = createTRPCRouter({
  create: protectedProcedure.input(newQuizSchema).mutation(({ input, ctx }) => {
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
      const quiz = await ctx.prisma.quiz.findUnique({
        include: {
          author: true,
          questions: true,
        },
        where: {
          publicId: input.quizId,
        },
      });

      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quiz not found",
        });
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

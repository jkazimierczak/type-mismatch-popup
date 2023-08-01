import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { questionSchema } from "@/models/quiz";
import { z } from "zod";
import { prisma } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { QUIZ_NOT_FOUND } from "@/server/api/errors";

export const questionRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        quizId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.question.findMany({
        where: {
          quiz: {
            publicId: input.quizId,
          },
        },
        include: {
          answers: true,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
        data: questionSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
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

      if (quiz.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permissions to modify this quiz.",
        });
      }

      if (ctx.session.user)
        return await ctx.prisma.question.create({
          data: {
            question: input.data.question,
            questionType: "MULTIPLE_CHOICE",
            quizId: quiz.id,
            answers: {
              createMany: {
                data: input.data.answers,
              },
            },
          },
        });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const quiz = await ctx.prisma.quiz.findFirst({
        where: {
          questions: {
            some: {
              id: input.questionId,
            },
          },
        },
        select: {
          authorId: true,
        },
      });

      if (!quiz)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });

      if (quiz.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permissions to modify this quiz.",
        });
      }

      return await ctx.prisma.question.delete({
        where: {
          id: input.questionId,
        },
      });
    }),
});

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { questionCreateSchema, questionEditSchema } from "src/validators";
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
          answers: {
            orderBy: {
              sequenceNumber: "asc",
            },
          },
        },
        orderBy: [{ sequenceNumber: "asc" }],
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
        data: questionCreateSchema,
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

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: questionEditSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const question = await ctx.prisma.question.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          quiz: true,
          answers: true,
        },
      });

      if (question.quiz.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permissions to modify this quiz.",
        });
      }

      const { data } = input;

      const upsertData = data.answers
        ?.filter((answer) => answer.id)
        .map((answer) => ({
          update: { answer: answer.answer, isCorrect: answer.isCorrect },
          create: { answer: answer.answer, isCorrect: answer.isCorrect },
          where: { id: answer.id },
        }));
      const createData = data.answers?.filter((answer) => !answer.id);

      await ctx.prisma.question.update({
        where: {
          id: input.id,
        },
        data: {
          question: data.question,
          answers: {
            upsert: upsertData,
            createMany: { data: createData ?? [] },
          },
        },
      });

      await ctx.prisma.answer.deleteMany({
        where: {
          id: { in: data.answersToDelete },
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

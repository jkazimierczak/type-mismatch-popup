import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { questionSchema } from "@/models/quiz";
import { z } from "zod";
import { prisma } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { QUIZ_NOT_FOUND } from "@/server/api/errors";

export const questionRouter = createTRPCRouter({
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
});

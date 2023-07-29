import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { questionSchema } from "@/models/quiz";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const questionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
        data: questionSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const quiz = await ctx.prisma.quiz.findUnique({
        select: {
          id: true,
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

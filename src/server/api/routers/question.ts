import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { questionSchema } from "@/models/quiz";
import { z } from "zod";
import { getQuizByPublicId } from "@/server/api/routers/quiz";

export const questionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
        data: questionSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const quiz = await getQuizByPublicId(input.quizId);

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

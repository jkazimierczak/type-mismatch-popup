import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { newQuizSchema } from "@/models/quiz";
import { nanoid } from "nanoid";

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
});

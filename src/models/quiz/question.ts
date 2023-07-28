import { z } from "zod";

export const answerSchema = z.object({
  answer: z.string(),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  question: z.string(),
  answers: z.array(answerSchema),
});

export type NewQuestionData = z.infer<typeof questionSchema>;

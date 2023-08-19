import { z } from "zod";

export const answerSchema = z.object({
  answer: z.string().min(1, "Odpowiedź nie może być pusta"),
  isCorrect: z.boolean(),
});

export const answerReadSchema = answerSchema.extend({
  id: z.string().optional(),
});

export const questionCreateSchema = z.object({
  question: z.string().min(1, "Pytanie nie może być puste"),
  answers: z
    .array(answerSchema)
    .min(2, "Musisz dodać conajmniej 2 odpowiedzi."),
});

export const questionEditSchema = z
  .object({
    question: z.string(),
    answers: z.array(
      answerSchema.extend({
        id: z.string().optional(),
      })
    ),
    answersToDelete: z.string().array(),
  })
  .partial();

export type AnswerData = z.infer<typeof answerSchema>;
export type AnswerReadData = z.infer<typeof answerReadSchema>;
export type QuestionData = z.infer<typeof questionCreateSchema>;
export type QuestionEditData = z.infer<typeof questionEditSchema>;

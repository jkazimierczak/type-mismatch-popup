import { z } from "zod";

export const answerSchema = z.object({
  answer: z.string().min(1, "Odpowiedź nie może być pusta"),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  question: z.string().min(1, "Pytanie nie może być puste"),
  answers: z
    .array(answerSchema)
    .min(2, "Musisz dodać conajmniej 2 odpowiedzi."),
});

export type AnswerData = z.infer<typeof answerSchema>;
export type QuestionData = z.infer<typeof questionSchema>;

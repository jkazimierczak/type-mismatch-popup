import { z } from "zod";

export const quizSchema = z.object({
  quizName: z.string().min(2, "Nazwa zbyt krótka").max(50, "Nazwa zbyt długa"),
  visibility: z.enum(["PRIVATE", "PUBLIC"]),
});

export type QuizData = z.infer<typeof quizSchema>;

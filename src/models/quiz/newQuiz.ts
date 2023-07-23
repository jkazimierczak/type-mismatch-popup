import { z } from "zod";

export const newQuizSchema = z.object({
  quizName: z.string().min(2, "Nazwa zbyt krótka").max(50, "Nazwa zbyt długa"),
  visibility: z.enum(["PRIVATE", "PUBLIC"]),
});

export type NewQuizData = z.infer<typeof newQuizSchema>;

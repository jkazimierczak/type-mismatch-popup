import { TRPCError } from "@trpc/server";

export const QUIZ_NOT_FOUND = new TRPCError({
  code: "NOT_FOUND",
  message: "Quiz not found.",
});

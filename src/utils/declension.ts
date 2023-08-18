import { clsx } from "clsx";

export function declensionQuestions(n: number) {
  const noun = clsx({
    brak: n === 0,
    pytanie: n === 1,
    pytania: n > 1 && n <= 4,
    pytań: n >= 5,
  });
  return `${n} ${noun}`;
}

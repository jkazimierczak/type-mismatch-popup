import { Button } from "@/components/Button";
import { IoArrowForward } from "react-icons/io5";
import { Input } from "@/components/Input";
import {
  type ComponentProps,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { clsx } from "clsx";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { type QuizData, quizSchema } from "src/validators";
import { api } from "@/utils/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { type GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";

interface InputRadioProps extends ComponentProps<"input"> {
  label: string;
}

const InputRadio = forwardRef<HTMLInputElement, InputRadioProps>(
  ({ label, ...props }, forwardedRef) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(
      forwardedRef,
      () => inputRef.current as HTMLInputElement
    );

    return (
      <label
        className={clsx({
          "grow px-4 py-2 font-medium leading-5 transition-colors": true,
          "bg-primary text-white": inputRef.current?.checked,
          "text-primary": !inputRef.current?.checked,
        })}
      >
        <input ref={inputRef} type="radio" {...props} className="hidden" />
        {label}
      </label>
    );
  }
);
InputRadio.displayName = "InputRadio";

const defaultValues: QuizData = {
  quizName: "",
  visibility: "PRIVATE",
};

export default function CreateQuiz() {
  const router = useRouter();
  const { mutate } = api.quiz.create.useMutation({
    onSuccess: (data) => {
      void router.push(data.publicId);
    },
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    control,
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<QuizData>({
    resolver: zodResolver(quizSchema),
    mode: "all",
    defaultValues,
  });

  const onSubmit: SubmitHandler<QuizData> = (data) => {
    mutate(data);
  };

  return (
    <>
      {isClient && <DevTool control={control} placement="top-left" />}

      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
        className="grid place-items-center px-7 text-center"
        style={{ height: "calc(100% - 72px)" }}
      >
        <div>
          <h1 className="mb-4 text-2xl font-bold text-white">
            Stwórz swój Quiz!
          </h1>
          <p className="mb-3">Podaj nazwę swojego Quizu:</p>
          <div>
            <Input placeholder="Nazwa Quizu" {...register("quizName")} />
            {errors.quizName && (
              <p className="mt-1 p-0.5 px-2 text-left text-red-500">
                {errors.quizName.message}
              </p>
            )}
          </div>
          <p className="my-3">i wybierz jego widoczność:</p>
          <div className="grid w-full grid-cols-2 divide-x divide-primary rounded border-2 border-primary">
            <Controller
              control={control}
              name="visibility"
              render={({ field }) => (
                <InputRadio
                  label="Prywatny"
                  {...field}
                  value="PRIVATE"
                  defaultChecked
                />
              )}
            />
            <Controller
              control={control}
              name="visibility"
              render={({ field }) => (
                <InputRadio label="Publiczny" {...field} value="PUBLIC" />
              )}
            />
          </div>
          <p className="my-4">
            {
              {
                PRIVATE:
                  "Dostęp do zawartości będą mieć tylko zaakceptowane przez Ciebie osoby.",
                PUBLIC: "Dostęp do zawartości będą mieć wszyscy.",
              }[getValues("visibility")]
            }
          </p>

          <Button
            type="submit"
            iconRight={<IoArrowForward />}
            variant="solid"
            onClick={void handleSubmit(onSubmit)}
            disabled={Object.keys(errors).length > 0}
          >
            Stwórz Quiz
          </Button>
        </div>
      </form>
    </>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "@/utils/api";
import "@/styles/globals.css";
import { Navbar } from "@/components/Navbar";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin-ext"],
  variable: "--font-inter",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div
        className={`${inter.variable} min-h-screen bg-dark-900 font-sans text-neutral-100`}
      >
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);

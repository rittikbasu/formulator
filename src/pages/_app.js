import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import localFont from "next/font/local";
import clsx from "clsx";

import { FiArrowUpRight } from "react-icons/fi";

import "@/styles/globals.css";

const f1Font = localFont({
  src: [
    {
      path: "../../public/fonts/Formula1-Regular-1.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Formula1-Bold_web.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

export default function App({ Component, pageProps }) {
  const [revolve, setRevolve] = useState(false);

  const handleImageClick = () => {
    setRevolve(true);
    setTimeout(() => setRevolve(false), 1000);
  };
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" type="image/png" />
        <title>Formulator - All Things Formula 1</title>
      </Head>
      <div className={clsx("max-w-7xl mx-auto p-8 md:py-16", f1Font.className)}>
        <div className="w-full min-h-screen fixed inset-0 -z-10 bg-black bg-dot-white/[0.2] flex items-center justify-center">
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        </div>
        <div className="flex justify-center md:mb-16 mb-8">
          <Image
            src="https://logodownload.org/wp-content/uploads/2016/11/formula-1-logo-7.png"
            className={clsx(
              "transition duration-1000",
              revolve && " animate-revolve -hue-rotate-90"
            )}
            onClick={handleImageClick}
            alt="F1 logo"
            height={100}
            width={200}
            unoptimized={true}
            priority
          />
        </div>
        <Component {...pageProps} />
        <footer className="mt-8 md:mt-16">
          <Link
            href="https://github.com/rittikbasu/formulator"
            className="flex items-center justify-center text-zinc-400 hover:text-fuchsia-500 tracking-widest"
          >
            source code
            <FiArrowUpRight className="h-5 w-5 ml-1" />
          </Link>
        </footer>
      </div>
      <Analytics />
    </>
  );
}

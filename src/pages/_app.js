import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import localFont from "next/font/local";
import clsx from "clsx";

import { FiArrowUpRight } from "react-icons/fi";

import "@/styles/globals.css";

import Selector from "@/components/Selector";
import NextRaceTicker from "@/components/NextRaceTicker";

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
  const [revolve, setRevolve] = useState(true);
  const [isHome, setIsHome] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevolve(false);
      setShowContent(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleImageClick = () => {
    setRevolve(true);
    setIsHome(true);
    setTimeout(() => {
      setRevolve(false);
    }, 1000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" type="image/png" />
        <title>Formulator - All Things Formula 1</title>
      </Head>
      <div className={clsx("max-w-7xl mx-auto", f1Font.className)}>
        <div
          className={clsx(
            "w-full min-h-screen fixed inset-0 -z-10 bg-black bg-dot-white/[0.2] flex items-center justify-center",
            "transition-opacity duration-[2000ms]",
            showContent ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        </div>
        <div
          className={clsx(
            "flex items-center justify-center transition-all ease-in-out duration-1000",
            showContent ? "min-h-16" : "min-h-screen"
          )}
        >
          <Link
            href={revolve ? "#" : `/teams/${currentYear}`}
            className="flex justify-center md:my-16 mt-8 my-12"
            onClick={!revolve && handleImageClick}
          >
            <Image
              src="https://logodownload.org/wp-content/uploads/2016/11/formula-1-logo-7.png"
              className={clsx(
                "transition duration-1000",
                revolve && " animate-revolve -hue-rotate-90"
              )}
              alt="F1 logo"
              height={100}
              width={200}
              unoptimized={true}
              priority
            />
          </Link>
        </div>
        <div className={clsx(showContent ? "block" : "hidden")}>
          <div className="sticky top-0 z-20 w-full">
            <Selector isHome={isHome} setIsHome={setIsHome} />
          </div>
          <div className="p-8">
            <Component {...pageProps} />
            <footer className="my-8 md:mt-16">
              <Link
                href="https://github.com/rittikbasu/formulator"
                className="flex items-center justify-center text-zinc-400 hover:text-fuchsia-500 tracking-widest"
              >
                source code
                <FiArrowUpRight className="h-5 w-5 ml-1" />
              </Link>
            </footer>
          </div>
        </div>
      </div>
      <Analytics />
    </>
  );
}

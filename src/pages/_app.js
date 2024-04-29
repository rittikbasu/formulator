import Image from "next/image";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="max-w-7xl mx-auto p-8 md:py-16">
      <div className="w-full min-h-screen fixed inset-0 -z-10 bg-black bg-dot-white/[0.2] flex items-center justify-center">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>
      <div className="flex justify-center md:mb-16 mb-8">
        <Image
          src="https://logodownload.org/wp-content/uploads/2016/11/formula-1-logo-7.png"
          alt="F1 logo"
          height={100}
          width={200}
          unoptimized={true}
        />
      </div>
      <Component {...pageProps} />
    </div>
  );
}

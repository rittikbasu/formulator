import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

export default function ScrollToTopCar() {
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState("idle");
  const ticking = useRef(false);
  const isLaunching = useRef(false);
  const timeoutsRef = useRef([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const addTimeout = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current || isLaunching.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const modalOpen = document.body.style.overflow === "hidden";
        const scrolled = window.scrollY > 300;
        setIsVisible(scrolled && !modalOpen);
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  const handleClick = useCallback(() => {
    if (phase !== "idle") return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      window.scrollTo({ top: 0, behavior: "auto" });
      setIsVisible(false);
      return;
    }

    isLaunching.current = true;
    setPhase("windup");

    addTimeout(() => {
      setPhase("launch");
      window.scrollTo({ top: 0, behavior: "smooth" });

      addTimeout(() => {
        setPhase("hidden");
        addTimeout(() => {
          setPhase("idle");
          setIsVisible(false);
          // Release the lock after the car is hidden and scroll has settled
          addTimeout(() => {
            isLaunching.current = false;
          }, 300);
        }, 50);
      }, 600);
    }, 150);
  }, [phase, addTimeout]);

  if (!isVisible && phase === "idle") return null;

  const phaseClasses = {
    idle: "animate-car-idle",
    windup: "animate-car-windup",
    launch: "animate-car-launch",
    hidden: "opacity-0",
  };

  const showExhaust = phase === "launch";
  const showSpeedLines = phase === "launch";

  return (
    <div className="fixed bottom-4 right-2 md:bottom-6 xl:bottom-8 xl:right-4 2xl:right-8 z-30">
      <div
        className={
          isVisible && phase === "idle"
            ? "animate-car-appear"
            : phase === "hidden"
            ? "animate-car-disappear"
            : ""
        }
      >
        <button
          onClick={handleClick}
          disabled={phase !== "idle"}
          aria-label="Scroll to top"
          className={`car-button relative flex flex-col items-center justify-center p-2 gap-0.5 ${phaseClasses[phase] || ""}`}
        >
          {/* Stacked pulsing chevrons — light up bottom→top */}
          <div className="relative z-10 flex flex-col items-center" style={{ gap: '1px', marginBottom: '3px' }} aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <svg
                key={i}
                width="12"
                height="7"
                viewBox="0 0 12 7"
                fill="none"
                className="car-chevron"
                style={{ animationDelay: `${(2 - i) * 0.15}s` }}
              >
                <path
                  d="M1 6L6 1.5L11 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ))}
          </div>

          <div
            className={`car-glow absolute inset-0 rounded-full ${phase === "launch" ? "car-glow-active" : ""}`}
          />
          {showSpeedLines && (
            <div className="car-speed-lines active absolute inset-0 pointer-events-none" />
          )}
          {showExhaust && (
            <div className="car-exhaust animate-exhaust-trail absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none" />
          )}
          <Image
            src="/f1-car-topdown.png"
            width={48}
            height={104}
            alt="F1 car scroll to top"
            className="relative z-10 w-8 h-auto md:w-9 xl:w-12 2xl:w-14"
            unoptimized
          />
        </button>
      </div>
    </div>
  );
}

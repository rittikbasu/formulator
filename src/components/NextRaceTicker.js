import { useState, useEffect } from "react";

const NextRaceTicker = ({ raceDate, raceName, circuitName }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function calculateTimeLeft() {
    const now = new Date();
    const difference = raceDate - now;

    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div className="overflow-hidden whitespace-nowrap box-border w-full md:text-center md:border-none md:pt-2 bg-black bg-opacity-50 border-b border-gray-800">
      <div className="inline-block pl-full animate-ticker md:animate-none text-lg text-[#fbbf24]">
        <span className=" text-zinc-400">Next race →</span> {raceName}
        <span className=" text-zinc-400 mx-2">in</span> {timeLeft.days}d{" "}
        {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        <span className=" text-zinc-400 mx-2">at</span> {circuitName}
      </div>
    </div>
  );
};

export default NextRaceTicker;

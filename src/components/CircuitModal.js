import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import clsx from "clsx";

import { TbClockHour3 } from "react-icons/tb";
import { BiSolidStopwatch } from "react-icons/bi";
import {
  MdOutlineSocialDistance,
  MdKeyboardDoubleArrowUp,
  MdKeyboardDoubleArrowDown,
  MdArrowDropDown,
} from "react-icons/md";
import { FaEquals } from "react-icons/fa6";
import { IoIosArrowRoundBack } from "react-icons/io";

const CircuitModal = ({ circuit, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [titleInView, setTitleInView] = useState(true);
  const [selectedSession, setSelectedSession] = useState("race");
  const titleRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (circuit) {
      setIsVisible(true);
      setIsClosing(false);
      setTitleInView(true);
      setInfoOpen(false);
      // Default to the most recently completed session: race if done, else qualifying, else sprint
      if (circuit.results?.length) setSelectedSession("race");
      else if (circuit.qualifyingResults?.length) setSelectedSession("qualifying");
      else if (circuit.sprintResults?.length) setSelectedSession("sprint");
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      setTimeout(() => {
        setIsClosing(false);
        document.body.style.overflow = "unset";
      }, 500);
    }
  }, [circuit]);

  useEffect(() => {
    if (!titleRef.current || !scrollRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTitleInView(entry.isIntersecting),
      { root: scrollRef.current, threshold: 0 }
    );
    observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, [circuit]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!circuit) return null;

  const sessions = [];
  if (circuit.results?.length) sessions.push({ value: "race", label: "Race Results" });
  if (circuit.qualifyingResults?.length) sessions.push({ value: "qualifying", label: "Qualifying" });
  if (circuit.sprintResults?.length) sessions.push({ value: "sprint", label: "Sprint" });

  const activeSessionValue = sessions.find((s) => s.value === selectedSession)?.value ?? sessions[0]?.value ?? null;

  return (
    <div
      className={`fixed inset-0 bg-black webkit-backdrop-blur-lg bg-opacity-50 z-50 flex justify-center pt-8 md:items-center transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        transition: "transform 500ms ease-in-out",
        transform: isVisible
          ? isClosing
            ? "translateY(100%)"
            : "translateY(0)"
          : "translateY(100%)",
      }}
      onClick={handleBackdropClick}
    >
      <div className="bg-zinc-800/50 webkit-backdrop-blur-lg md:rounded-3xl rounded-t-3xl max-w-4xl md:h-5/6 w-full overflow-hidden flex flex-col">

        {/* Header — outside scroll area, no sticky needed */}
        <div className="flex-shrink-0 px-4 md:px-8 pt-4 pb-2 md:pt-5 md:pb-4">
          {/* Mobile: ← back left, animated "GP" fades in when title scrolls away */}
          <div className="md:hidden flex items-center justify-between">
            <div
              className="flex items-center cursor-pointer text-red-700 hover:text-red-500 transition-colors"
              onClick={handleClose}
            >
              <IoIosArrowRoundBack className="h-8 w-8" />
              <span className="ml-1">back</span>
            </div>
            <span
              className={`text-zinc-300 text-sm font-medium mr-1 transition-all duration-300 ${
                titleInView
                  ? "opacity-0 -translate-y-1"
                  : "opacity-100 translate-y-0"
              }`}
            >
              {(circuit.raceName || circuit.country + " Grand Prix").replace("Grand Prix", "GP")}
            </span>
          </div>
          {/* Desktop: ← back left, centered title */}
          <div className="hidden md:flex items-center relative min-h-[2.5rem]">
            <div
              className="flex items-center cursor-pointer text-red-700 hover:text-red-500 transition-colors"
              onClick={handleClose}
            >
              <IoIosArrowRoundBack className="h-10 w-10" />
              <span className="ml-1 text-lg">back</span>
            </div>
            <h2 className="absolute inset-x-0 text-center text-xl text-zinc-200 px-28 truncate pointer-events-none">
              {circuit.raceName || circuit.country + " Grand Prix"}
            </h2>
          </div>
        </div>

        {/* Scroll area — mask fades top edge so content dissolves behind header */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 md:px-8 pb-20 md:pb-32 mask-fade-top"
        >
          {/* Mobile big title — inside scroll so IntersectionObserver can track it */}
          <h2
            ref={titleRef}
            className="md:hidden text-2xl text-center text-zinc-200 pb-4 pt-2"
          >
            {circuit.raceName || circuit.country + " Grand Prix"}
          </h2>

          <Image
            src={circuit.circuitImage}
            alt={`${circuit.circuitName} Circuit`}
            width={400}
            height={225}
            className="rounded-md mb-6 w-full md:mt-4"
          />

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 text-white mb-2">
            <div>
              <h4 className="md:text-xl text-sm text-zinc-500">
                First Grand Prix
              </h4>
              <p className="text-2xl md:text-3xl">{circuit.firstGrandPrix}</p>
            </div>
            <div>
              <h4 className="md:text-xl text-sm text-zinc-500">
                Number of Laps
              </h4>
              <p className="text-2xl md:text-3xl">{circuit.numberOfLaps}</p>
            </div>
            <div>
              <h4 className="md:text-xl text-sm text-zinc-500">
                Circuit Length
              </h4>
              <p className="text-2xl md:text-3xl">{circuit.circuitLength} km</p>
            </div>
            <div>
              <h4 className="md:text-xl text-sm text-zinc-500">Lap Record</h4>
              <p className="text-2xl md:text-3xl">{circuit.lapRecord}</p>
              <p className="text-sm md:text-xl text-zinc-400">
                {circuit.lapRecordBy} ({circuit.lapRecordOn})
              </p>
            </div>
          </div>

          {sessions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-zinc-700/30">
              {/* Session selector + info toggle on same row */}
              <div className="flex items-center justify-between mb-3">
                {sessions.length === 1 ? (
                  <h3 className="text-xl md:text-3xl font-medium text-zinc-200">
                    {sessions[0].label}
                  </h3>
                ) : (
                  <div className="relative inline-block">
                    <select
                      className="appearance-none bg-zinc-900/60 border border-zinc-800/60 rounded-xl text-zinc-200 pl-4 pr-9 py-2 text-xl md:text-3xl font-medium cursor-pointer outline-none focus:border-zinc-700/80 transition-colors"
                      value={activeSessionValue}
                      onChange={(e) => {
                        setSelectedSession(e.target.value);
                        setInfoOpen(false);
                      }}
                    >
                      {sessions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <MdArrowDropDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-500" />
                  </div>
                )}
                {activeSessionValue !== "qualifying" && (
                  <button
                    className={clsx(
                      "text-sm md:text-base tracking-widest flex items-center transition-colors duration-300",
                      infoOpen
                        ? "text-zinc-400 hover:text-zinc-500"
                        : "text-sky-400 hover:text-sky-500"
                    )}
                    onClick={() => setInfoOpen(!infoOpen)}
                  >
                    info
                    <MdArrowDropDown
                      className={`h-6 w-6 transition-transform ${
                        infoOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Info legend — collapsible, race/sprint only */}
              {activeSessionValue !== "qualifying" && (
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    infoOpen ? "max-h-64" : "max-h-0"
                  }`}
                >
                  <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 mb-3">
                    <div className="grid md:grid-cols-3 grid-cols-2 gap-y-2 text-xs md:text-sm">
                      <div className="flex items-center">
                        <MdKeyboardDoubleArrowUp className="h-4 w-4 text-green-600" />
                        <span className="ml-2 text-zinc-200">Positions Gained</span>
                      </div>
                      <div className="flex items-center">
                        <MdKeyboardDoubleArrowDown className="h-4 w-4 text-red-700" />
                        <span className="ml-2 text-zinc-200">Positions Lost</span>
                      </div>
                      <div className="flex items-center">
                        <BiSolidStopwatch className="h-4 w-4 text-zinc-300" />
                        <span className="ml-2 text-zinc-200">Personal Best Lap</span>
                      </div>
                      <div className="flex items-center">
                        <BiSolidStopwatch className="h-4 w-4 text-fuchsia-500" />
                        <span className="ml-2 text-zinc-200">
                          {activeSessionValue === "sprint" ? "Sprint" : "Race"} Fastest Lap
                        </span>
                      </div>
                      <div className="flex items-center ml-[0.04rem]">
                        <TbClockHour3 className="mr-[0.1rem] w-[0.9rem] h-[0.9rem] text-zinc-300" />
                        <span className="ml-2 text-zinc-200">Finishing Time</span>
                      </div>
                      <div className="flex items-center">
                        <MdOutlineSocialDistance className="mr-[0.04rem] w-4 h-4 text-zinc-300" />
                        <span className="ml-2 text-zinc-200">Gap to Leader</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Race results */}
              {activeSessionValue === "race" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-y-8">
                  {circuit.results.map((result, index) => (
                    <RaceResultCard
                      key={index}
                      result={result}
                      fastestDriver={circuit.fastestDriver}
                    />
                  ))}
                </div>
              )}

              {/* Qualifying results */}
              {activeSessionValue === "qualifying" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-y-8">
                  {circuit.qualifyingResults.map((result, index) => (
                    <QualifyingResultCard key={index} result={result} />
                  ))}
                </div>
              )}

              {/* Sprint results */}
              {activeSessionValue === "sprint" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-y-8">
                  {circuit.sprintResults.map((result, index) => (
                    <RaceResultCard
                      key={index}
                      result={result}
                      fastestDriver={circuit.sprintFastestDriver}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RaceResultCard = ({ result, fastestDriver }) => (
  <div className="bg-zinc-800/50 p-4 rounded-xl shadow-md grid grid-cols-6 gap-4 relative border border-zinc-700/30">
    <div className="col-span-1">
      <h5 className="text-lg text-white">{result.position}</h5>
      <p
        className={`text-xs ${
          result.positionsGained < 0 ? "text-red-700" : "text-green-600"
        }`}
      >
        <span className="inline-flex items-center">
          {result.positionsGained < 0 ? (
            <MdKeyboardDoubleArrowDown className="h-4 w-4" />
          ) : result.positionsGained > 0 ? (
            <MdKeyboardDoubleArrowUp className="h-4 w-4" />
          ) : (
            <FaEquals className="h-3 w-3 mr-1" />
          )}{" "}
          {Math.abs(result.positionsGained)}
        </span>
      </p>
    </div>
    <div className="col-span-3">
      <h5 className="text-lg md:text-xl text-white">
        {result.driver.split(" ")[0]}
        <br />
        {result.driver.split(" ")[1]}
      </h5>
      <p className="text-xs md:text-sm text-zinc-400">{result.constructor}</p>
      {result.fastestLapNumber !== "N/A" && (
        <p
          className={clsx(
            "text-xs md:text-sm pt-2",
            fastestDriver === result.driver ? "text-fuchsia-500" : "text-gray-400"
          )}
        >
          <span className="inline-flex items-center">
            <BiSolidStopwatch className="mr-1 -ml-0.5 h-4 w-4" />{" "}
            Lap {result.fastestLapNumber} : {result.fastestLapTime}
          </span>
        </p>
      )}
    </div>
    <div className="col-span-2">
      <h5 className="text-lg text-white text-right">
        {result.points}
        <br /> pts
      </h5>
      <p className="text-xs md:text-sm">&nbsp;</p>
      {result.status === "Finished" ? (
        result.gapToLeader !== "N/A" && (
          <p className="text-xs md:text-sm text-zinc-400 pt-2">
            {result.position === "01" ? (
              <span className="inline-flex items-center">
                <TbClockHour3 className="mr-1 w-[0.9rem] h-[0.9rem]" />
                {result.gapToLeader}
              </span>
            ) : (
              <span>
                <span className="inline-flex items-center">
                  <MdOutlineSocialDistance className="mr-1 w-4 h-4" />
                  <span className="font-mono">+</span>
                  {result.gapToLeader.endsWith("Lap") ||
                  result.gapToLeader.endsWith("Laps")
                    ? result.gapToLeader
                    : `${result.gapToLeader}s`}
                </span>
              </span>
            )}
          </p>
        )
      ) : (
        <p className="text-md text-right text-red-900 pt-0.5">{result.status}</p>
      )}
    </div>
  </div>
);

const QualifyingResultCard = ({ result }) => (
  <div className="bg-zinc-800/50 p-4 rounded-xl shadow-md grid grid-cols-6 gap-4 relative border border-zinc-700/30">
    <div className="col-span-1">
      <h5 className="text-lg text-white">{result.position}</h5>
      {result.position === "01" && (
        <p className="text-xs text-amber-400">Pole</p>
      )}
    </div>
    <div className="col-span-3">
      <h5 className="text-lg md:text-xl text-white">
        {result.driver.split(" ")[0]}
        <br />
        {result.driver.split(" ")[1]}
      </h5>
      <p className="text-xs md:text-sm text-zinc-400">{result.constructor}</p>
    </div>
    <div className="col-span-2 flex flex-col gap-1 justify-center">
      {[
        { label: "Q3", value: result.q3, labelColor: "text-zinc-500", valueColor: "text-zinc-200" },
        { label: "Q2", value: result.q2, labelColor: "text-zinc-500", valueColor: "text-zinc-400" },
        { label: "Q1", value: result.q1, labelColor: "text-zinc-600", valueColor: "text-zinc-500" },
      ].map(({ label, value, labelColor, valueColor }) => (
        <p key={label} className="text-xs font-mono flex justify-end">
          <span className={`w-6 shrink-0 ${value !== "N/A" ? labelColor : "text-zinc-700"}`}>{label}</span>
          <span className={`w-16 ${value !== "N/A" ? `text-right ${valueColor}` : "text-center text-zinc-700"}`}>
            {value !== "N/A" ? value : "—"}
          </span>
        </p>
      ))}
    </div>
  </div>
);

export default CircuitModal;

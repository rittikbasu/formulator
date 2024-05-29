import { useState, useEffect } from "react";
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

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-2">
      <button
        className={clsx(
          "text-sm md:text-base tracking-widest flex items-center ml-1 transition-colors duration-300",
          isOpen
            ? "text-zinc-400 md:hover:text-zinc-500"
            : "text-sky-400 md:hover:text-sky-500"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <MdArrowDropDown
          className={`h-6 w-6 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};

const CircuitModal = ({ circuit, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (circuit) {
      setIsVisible(true);
      setIsClosing(false);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      setTimeout(() => {
        setIsClosing(false);
        document.body.style.overflow = "unset"; // Enable scroll on body
      }, 500); // Delay should match the CSS transition duration
    }
  }, [circuit]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 500); // Delay should match the CSS transition duration
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!circuit) return null;

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
      <div className="bg-zinc-800/50 webkit-backdrop-blur-lg md:rounded-3xl rounded-t-3xl max-w-4xl md:h-5/6  w-full overflow-hidden">
        <div
          className="md:hidden flex items-center cursor-pointer md:px-8 px-4 my-4 text-red-700 hover:text-red-500"
          onClick={handleClose}
        >
          <IoIosArrowRoundBack className="h-8 w-8 md:h-10 md:w-10" />
          <span className="ml-2 md:text-lg">back</span>
        </div>
        <div
          className="fixed hidden md:flex top-3.5 left-0 items-center cursor-pointer md:px-8 px-4 my-4 text-red-700 hover:text-red-500"
          onClick={handleClose}
        >
          <IoIosArrowRoundBack className="h-8 w-8 md:h-10 md:w-10" />
          <span className="ml-2 md:text-xl">back</span>
        </div>
        <h2 className="text-2xl md:text-3xl hidden md:block text-center text-zinc-200 pl-2 py-8">
          {circuit.raceName || circuit.country + " Grand Prix"}
        </h2>
        {/* <div className="drag-handle md:hidden mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-400 my-4 cursor-grab" /> */}
        <div className="h-full overflow-scroll px-4 md:pt-8 md:px-8 pb-20 md:pb-32">
          <h2 className="text-2xl md:text-3xl text-center text-zinc-200 pl-2 pb-4 md:hidden block">
            {circuit.raceName || circuit.country + " Grand Prix"}
          </h2>
          <Image
            src={circuit.circuitImage}
            alt={`${circuit.circuitName} Circuit`}
            width={400}
            height={225}
            className="rounded-md mb-4 w-full"
          />

          <div className="grid grid-cols-2 gap-1 md:gap-4 text-white">
            <div className="p-2 rounded-lg">
              <h4 className="md:text-xl text-md text-zinc-500">
                First Grand Prix
              </h4>
              <p className="text-2xl md:text-3xl">{circuit.firstGrandPrix}</p>
            </div>
            <div className="p-2 rounded-lg">
              <h4 className="md:text-xl text-md text-zinc-500">
                Number of Laps
              </h4>
              <p className="text-2xl md:text-3xl">{circuit.numberOfLaps}</p>
            </div>
            <div className="p-2 rounded-lg">
              <h4 className="md:text-xl text-md text-zinc-500">
                Circuit Length
              </h4>
              <p className="text-2xl md:text-3xl">{circuit.circuitLength} km</p>
            </div>
            <div className="p-2 rounded-lg">
              <h4 className="md:text-xl text-md text-zinc-500">
                Race Distance
              </h4>
              <p className="text-2xl md:text-3xl">{circuit.raceDistance} km</p>
            </div>
            <div className="p-2 rounded-lg col-span-2">
              <h4 className="md:text-xl text-md text-zinc-500">Lap Record</h4>
              <p className="text-2xl md:text-3xl">{circuit.lapRecord}</p>
              <p className="text-md md:text-xl text-zinc-400">
                By {circuit.lapRecordBy} in {circuit.lapRecordOn}
              </p>
            </div>
          </div>
          {circuit.results && circuit.results.length > 0 && (
            <div className="mt-4 p-2">
              <h4 className="text-xl md:text-3xl text-zinc-200">
                Race Results
              </h4>
              <Accordion title="info">
                <div className="grid md:grid-cols-3 grid-cols-2 gap-y-2 mt-2 mb-4 text-xs md:text-sm ml-1">
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
                    <span className="ml-2 text-zinc-200">
                      Personal Best Lap
                    </span>
                  </div>
                  <div className="flex items-center">
                    <BiSolidStopwatch className="h-4 w-4 text-fuchsia-500" />
                    <span className="ml-2 text-zinc-200">Race Fastest Lap</span>
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
              </Accordion>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-y-8">
                {circuit.results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-zinc-800/50 p-4 rounded-xl shadow-md grid grid-cols-6 gap-4 relative"
                  >
                    <div className="col-span-1">
                      <h5 className="text-lg text-white">{result.position}</h5>
                      <p
                        className={`text-xs ${
                          result.positionsGained < 0
                            ? "text-red-700"
                            : "text-green-600"
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
                      <p className="text-xs md:text-sm text-zinc-400">
                        {result.constructor}
                      </p>
                      {result.fastestLapNumber !== "N/A" && (
                        <p
                          className={clsx(
                            "text-xs md:text-sm pt-2",
                            circuit.fastestDriver === result.driver
                              ? "text-fuchsia-500"
                              : "text-gray-400"
                          )}
                        >
                          <span className="inline-flex items-center">
                            <BiSolidStopwatch className="mr-1 -ml-0.5 h-4 w-4" />{" "}
                            Lap {result.fastestLapNumber} :{" "}
                            {result.fastestLapTime}
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
                        <p className="text-md text-right text-red-900 pt-0.5">
                          {result.status}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircuitModal;

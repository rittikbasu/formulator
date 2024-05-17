import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import axios from "axios";
import { parse } from "node-html-parser";

import { TbClockHour3 } from "react-icons/tb";
import { BiSolidStopwatch } from "react-icons/bi";
import { MdOutlineSocialDistance } from "react-icons/md";
import { MdKeyboardDoubleArrowUp } from "react-icons/md";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import { FaEquals } from "react-icons/fa6";
import { IoIosArrowRoundBack } from "react-icons/io";

import Selector from "@/components/Selector";

const Drivers = ({ circuits, year }) => {
  // console.log(circuits);
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (circuit) => {
    setSelectedCircuit(circuit);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isModalOpen]);
  return (
    <>
      <Head>
        <title>Formulator - All things Formula 1</title>
      </Head>
      <Selector year={year} category="races" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-8">
        {circuits &&
          circuits.map((circuit) => (
            <div
              className="max-w-sm mx-auto relative group"
              key={circuit.circuitName}
              onClick={() => openModal(circuit, closeModal)}
            >
              <div className="absolute z-0 blur-3xl h-20 w-20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-1000 bg-red-500"></div>
              <div className="bg-zinc-900/50 backdrop-blur-sm webkit-backdrop-blur p-4 rounded-3xl border border-zinc-900 group-hover:border-red-900 transition duration-300">
                <h3 className="text-zinc-200 text-lg mb-2 line-clamp-1">
                  <span className="uppercase font-bold text-red-500">
                    {circuit.circuitName}
                  </span>
                  , {circuit.country}
                </h3>
                <Image
                  src={circuit.circuitImage}
                  alt={`${circuit.circuitName} Circuit`}
                  width={400}
                  height={225}
                  unoptimized={true}
                  onError={(e) => {
                    e.target.src =
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/991px-Placeholder_view_vector.svg.png";
                  }}
                  className="rounded-md"
                />
              </div>
            </div>
          ))}
      </div>
      {isModalOpen && (
        <CircuitModal circuit={selectedCircuit} onClose={closeModal} />
      )}
    </>
  );
};

export default Drivers;

const CircuitModal = ({ circuit, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // State to handle closing animation

  useEffect(() => {
    if (circuit) {
      setIsVisible(true);
      setIsClosing(false);
      document.body.style.overflow = "hidden"; // Disable scroll on body
    } else {
      setIsVisible(false);
      setTimeout(() => {
        setIsClosing(false); // Reset closing state after animation
        document.body.style.overflow = "unset"; // Enable scroll on body
      }, 500); // Delay should match the CSS transition duration
    }
  }, [circuit]);

  const handleClose = () => {
    setIsClosing(true); // Start closing animation
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
      className={`fixed inset-0 bg-black backdrop-blur bg-opacity-50 z-50 flex justify-center pt-8 md:items-center transition-opacity duration-300 ${
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
      <div className="bg-zinc-800/50 backdrop-blur md:rounded-3xl rounded-t-3xl max-w-4xl md:h-5/6  w-full overflow-hidden">
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
          {circuit.raceName}
        </h2>
        {/* <div className="drag-handle md:hidden mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-400 my-4 cursor-grab" /> */}
        <div className="h-full overflow-scroll px-4 md:pt-8 md:px-8 pb-20 md:pb-32">
          <h2 className="text-2xl md:text-3xl text-center text-zinc-200 pl-2 pb-4 md:hidden block">
            {circuit.raceName}
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

          <div className="mt-4 p-2">
            <h4 className="text-xl md:text-3xl text-zinc-200 mb-2 md:mb-4">
              Race Results
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-y-8">
              {circuit.results.map((result, index) => (
                <div
                  key={index}
                  className="bg-zinc-800/50 p-4 rounded-xl shadow-md grid grid-cols-6 gap-4"
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
                      <p className="text-xs md:text-sm text-zinc-400 pt-2">
                        <span className="inline-flex items-center">
                          <BiSolidStopwatch className="mr-1 h-4 w-4" /> Lap{" "}
                          {result.fastestLapNumber} : {result.fastestLapTime}
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
                                {result.gapToLeader}
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
        </div>
      </div>
    </div>
  );
};

export const getStaticPaths = async () => {
  const years = ["2024", "2023"];
  return {
    paths: years.map((year) => ({
      params: {
        slug: year,
      },
    })),
    fallback: true,
  };
};

export const getStaticProps = async (context) => {
  const { slug } = context.params;
  let circuits = [];
  const response = await fetch(
    `https://api.openf1.org/v1/sessions?session_name=Race&year=${slug}`
  );
  const sessionsData = await response.json();

  const fetchPromises = sessionsData.map(async (session, index) => {
    const countryName = session.country_name;
    let circuitName = session.circuit_short_name;

    const circuitNameOverrides = {
      Austin: "USA",
      "Yas Marina Circuit": "Abu_Dhabi",
      "Monte Carlo": "Monoco",
    };

    circuitName =
      circuitNameOverrides[circuitName] || circuitName.replace(/\s+/g, "_");

    const circuitImageUrl = `https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${circuitName}_Circuit.png`;
    const countryImageUrl = `https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${countryName.replace(
      /\s+/g,
      "_"
    )}_Circuit.png`;

    const imageUrl = await fetch(circuitImageUrl, { method: "HEAD" })
      .then((response) => (response.ok ? circuitImageUrl : countryImageUrl))
      .catch(() => countryImageUrl);

    // Fetching stats for each circuit
    const statsUrl = `https://www.formula1.com/en/racing/${slug}/${countryName.replace(
      /\s+/g,
      "_"
    )}/Circuit.html`;
    const { data } = await axios.get(statsUrl);
    const root = parse(data);
    const stats = {};
    root.querySelectorAll(".f1-stat").forEach((stat) => {
      const labelElement = stat.querySelector(".misc--label");
      const valueElement = stat.querySelector(".f1-bold--stat");
      if (labelElement && valueElement) {
        const label = labelElement.textContent.trim();
        const value = valueElement.textContent.trim();
        stats[label] = value;
      }
    });

    // Parsing lap record into multiple parts
    const lapRecordRegex = /(\d+:\d+\.\d+)\s+(.*?)\s+\((\d{4})\)/;
    const lapRecordMatch = stats["Lap Record"].match(lapRecordRegex);
    const lapRecord = lapRecordMatch ? lapRecordMatch[1] : "N/A";
    const lapRecordBy = lapRecordMatch ? lapRecordMatch[2] : "N/A";
    const lapRecordOn = lapRecordMatch ? lapRecordMatch[3] : "N/A";

    // Fetch race results from Ergast API
    const roundNumber = index + 1;
    const resultsResponse = await fetch(
      `https://ergast.com/api/f1/${slug}/${roundNumber}/results.json`
    );
    const resultsData = await resultsResponse.json();
    const results = resultsData.MRData.RaceTable.Races[0].Results.map(
      (result) => ({
        position: result.position.padStart(2, "0"),
        driver: result.Driver.givenName + " " + result.Driver.familyName,
        constructor: result.Constructor.name,
        points: result.points,
        laps: result.laps,
        status:
          result.status === "Finished" || result.status.endsWith("Lap")
            ? "Finished"
            : "DNF",
        positionsGained: parseInt(result.grid) - parseInt(result.position),
        fastestLapTime: result.FastestLap ? result.FastestLap.Time.time : "N/A",
        fastestLapNumber: result.FastestLap ? result.FastestLap.lap : "N/A",
        gapToLeader: result.Time ? result.Time.time.replace("+", "") : "N/A",
      })
    );

    const raceName = resultsData.MRData.RaceTable.Races[0].raceName;

    return {
      circuitName: session.circuit_short_name,
      country: countryName,
      raceName: raceName,
      circuitImage: imageUrl,
      firstGrandPrix: stats["First Grand Prix"] || "N/A",
      numberOfLaps: stats["Number of Laps"] || "N/A",
      circuitLength: parseFloat(stats["Circuit Length"]).toFixed(2) || "N/A",
      raceDistance: parseFloat(stats["Race Distance"]).toFixed(2) || "N/A",
      lapRecord: lapRecord,
      lapRecordBy: lapRecordBy,
      lapRecordOn: lapRecordOn,
      results: results,
    };
  });

  circuits = await Promise.all(fetchPromises);

  return {
    props: { circuits: circuits, year: slug },
    revalidate: 1,
  };
};

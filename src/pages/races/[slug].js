import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import axios from "axios";
import { parse } from "node-html-parser";

import Selector from "@/components/Selector";
import CircuitModal from "@/components/CircuitModal";

const Drivers = ({ circuits, year }) => {
  console.log(circuits);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14 mt-8">
        {circuits &&
          circuits.map((circuit) => (
            <div
              className="max-w-sm mx-auto relative group"
              key={circuit.circuitName}
              onClick={() => openModal(circuit, closeModal)}
            >
              <div className="absolute z-0 blur-3xl h-20 w-20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-1000 bg-red-500"></div>
              <div className="absolute z-10 mr-2 md:tracking-wide text-sm -top-8 right-0 py-2.5 rounded-xl text-zinc-400 transition duration-300">
                {circuit.raceDate}
              </div>
              <div className="bg-zinc-900/50 webkit-backdrop-blur p-4 rounded-3xl border border-zinc-900 group-hover:border-red-900 transition duration-300">
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

    let fastestDriver = null;

    // Fetch race results from Ergast API
    const roundNumber = index + 1;
    const resultsResponse = await fetch(
      `https://ergast.com/api/f1/${slug}/${roundNumber}/results.json`
    );
    const resultsData = await resultsResponse.json();
    const race = resultsData.MRData.RaceTable.Races[0];

    const results =
      race && race.Results
        ? race.Results.map((result) => {
            if (result.FastestLap && result.FastestLap.rank === "1") {
              fastestDriver =
                result.Driver.givenName + " " + result.Driver.familyName;
            }
            return {
              position: result.position.padStart(2, "0"),
              driver: result.Driver.givenName + " " + result.Driver.familyName,
              constructor: result.Constructor.name,
              points: result.points,
              laps: result.laps,
              status:
                result.status === "Finished" || result.status.endsWith("Lap")
                  ? "Finished"
                  : "DNF",
              positionsGained:
                parseInt(result.grid) - parseInt(result.position),
              fastestLapTime: result.FastestLap
                ? result.FastestLap.Time.time
                : "N/A",
              fastestLapNumber: result.FastestLap
                ? result.FastestLap.lap
                : "N/A",
              gapToLeader: result.Time
                ? result.Time.time.replace("+", "")
                : "N/A",
            };
          })
        : [];

    const raceName = race ? race.raceName : null;
    const raceDate = race
      ? new Date(race.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

    return {
      circuitName: session.circuit_short_name,
      country: session.country_name,
      raceName,
      raceDate,
      circuitImage: imageUrl,
      firstGrandPrix: stats["First Grand Prix"] || "N/A",
      numberOfLaps: stats["Number of Laps"] || "N/A",
      circuitLength: parseFloat(stats["Circuit Length"]).toFixed(2) || "N/A",
      raceDistance: parseFloat(stats["Race Distance"]).toFixed(2) || "N/A",
      lapRecord,
      lapRecordBy,
      lapRecordOn,
      results,
      fastestDriver,
    };
  });

  circuits = await Promise.all(fetchPromises);
  circuits.reverse();

  return {
    props: { circuits: circuits, year: slug },
    revalidate: 1,
  };
};

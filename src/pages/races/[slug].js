import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Image from "next/image";

import CircuitModal from "@/components/CircuitModal";
import { buildCircuitStatsKey } from "@/lib/f1/circuitStats.mjs";
import {
  getAvailableSeasons,
  getCircuitImageUrl,
  getCircuitStats,
  getLatestAvailableSeason,
  getOpenF1RaceSessions,
  getSeasonQualifyingResults,
  getSeasonRaceResults,
  getSeasonSprintResults,
  getSeasonRevalidateSeconds,
  isSupportedSeason,
} from "@/lib/f1/index.mjs";

const CIRCUIT_PLACEHOLDER_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/991px-Placeholder_view_vector.svg.png";

const DISPLAY_LOCATION_BY_STATS_KEY = {
  bahrain: "Sakhir",
  "saudi-arabia": "Jeddah",
  australia: "Melbourne",
  china: "Shanghai",
  japan: "Suzuka",
  miami: "Miami",
  "emilia-romagna": "Imola",
  monaco: "Monte Carlo",
  spain: "Barcelona",
  canada: "Montreal",
  austria: "Spielberg",
  "great-britain": "Silverstone",
  belgium: "Spa-Francorchamps",
  hungary: "Budapest",
  netherlands: "Zandvoort",
  italy: "Monza",
  azerbaijan: "Baku",
  singapore: "Singapore",
  qatar: "Lusail",
  "united-states": "Austin",
  mexico: "Mexico City",
  brazil: "Sao Paulo",
  "las-vegas": "Las Vegas",
  "abu-dhabi": "Yas Island",
};

const DISPLAY_COUNTRY_ALIASES = {
  "United States": "USA",
  "United Kingdom": "UK",
  "United Arab Emirates": "UAE",
};

function formatRaceWeekendDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const raceDate = new Date(dateValue);

  if (Number.isNaN(raceDate.getTime())) {
    return null;
  }

  const raceDay = raceDate.getUTCDate();
  const startDate = new Date(raceDate);
  startDate.setUTCDate(raceDay - 2);
  const startDay = startDate.getUTCDate();
  const month = raceDate.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });

  return `${startDay} - ${raceDay} ${month}`;
}

function getRaceDisplayLabel({ session, raceData, circuitMeta }) {
  const statsKey = buildCircuitStatsKey(circuitMeta);
  const location =
    session?.location || DISPLAY_LOCATION_BY_STATS_KEY[statsKey] || raceData?.country;
  const country =
    DISPLAY_COUNTRY_ALIASES[session?.country_name] ||
    raceData?.country ||
    session?.country_name ||
    circuitMeta.countryName;

  return {
    location,
    country,
  };
}

const Races = ({ circuits, year }) => {
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const nextRaceRound = useMemo(() => {
    if (Number(year) !== new Date().getFullYear()) {
      return null;
    }

    return (
      circuits.find((circuit) => !circuit.results || circuit.results.length === 0)
        ?.round || null
    );
  }, [circuits, year]);

  const openModal = (circuit) => {
    setSelectedCircuit(circuit);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <>
      <Head>
        <title>Formulator - All things Formula 1</title>
      </Head>

      <div className="grid grid-cols-1 gap-14 mt-8 mb-11 md:grid-cols-2 lg:grid-cols-3">
        {circuits.map((circuit) => (
          <button
            type="button"
            className="relative mx-auto w-full max-w-sm text-left group"
            key={`${circuit.round}-${circuit.circuitName}`}
            onClick={() => openModal(circuit)}
          >
            <div className="absolute top-1/2 left-1/2 z-0 w-20 h-20 bg-red-500 rounded-full blur-3xl transition-colors duration-1000 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex absolute right-2 left-2 -top-8 z-10 gap-3 justify-between items-center text-sm text-zinc-400">
              <span className="rounded-full border border-zinc-800 bg-zinc-950/80 px-3 py-0.5 uppercase tracking-[0.25em] text-[0.65rem] text-zinc-300">
                Round {String(circuit.round).padStart(2, "0")}
              </span>
              <span className="md:tracking-wide">{circuit.raceDate}</span>
            </div>
            <div className="p-4 rounded-3xl border transition duration-300 bg-zinc-900/50 webkit-backdrop-blur border-zinc-900 group-hover:border-red-900">
              <h3 className="mb-2 text-lg text-zinc-200 line-clamp-1">
                <span className="font-bold text-red-500 uppercase">
                  {circuit.displayLocation}
                </span>
                , {circuit.displayCountry}
              </h3>
              <div className="relative">
                <Image
                  src={circuit.circuitImage}
                  alt={`${circuit.circuitName} Circuit`}
                  width={400}
                  height={225}
                  unoptimized={true}
                  onError={(event) => {
                    event.target.src = CIRCUIT_PLACEHOLDER_URL;
                  }}
                  className="rounded-md"
                />
                {circuit.round === nextRaceRound && (
                  <div className="absolute -bottom-2 -right-1 shrink-0 rounded-full border border-emerald-500/40 bg-black/70 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-emerald-300 backdrop-blur-sm">
                    Next Race
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      {isModalOpen && (
        <CircuitModal circuit={selectedCircuit} onClose={closeModal} />
      )}
    </>
  );
};

export default Races;

export function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps(context) {
  const year = context.params?.slug;
  const isCurrentSeason = Number(year) === new Date().getFullYear();

  if (!isSupportedSeason(year)) {
    return {
      notFound: true,
      revalidate: getSeasonRevalidateSeconds(String(new Date().getFullYear())),
    };
  }

  const [availableYears, latestAvailableYear, sessions, raceResultsByRound, qualifyingByRound, sprintByRound] =
    await Promise.all([
      getAvailableSeasons(),
      getLatestAvailableSeason(),
      getOpenF1RaceSessions(year),
      getSeasonRaceResults(year),
      getSeasonQualifyingResults(year),
      getSeasonSprintResults(year),
    ]);

  if (sessions.length === 0 && raceResultsByRound.size === 0) {
    return {
      notFound: true,
      revalidate: getSeasonRevalidateSeconds(year),
    };
  }

  const roundKeys = isCurrentSeason
    ? new Set(
        sessions
          .map((_, index) => String(index + 1))
          .concat([...raceResultsByRound.keys()])
      )
    : new Set([...raceResultsByRound.keys()]);

  const circuits = await Promise.all(
    [...roundKeys]
      .sort((left, right) => Number(left) - Number(right))
      .map(async (roundKey) => {
      const raceData = raceResultsByRound.get(roundKey);
      const session = isCurrentSeason ? sessions[Number(roundKey) - 1] : null;
      const countryName =
        session?.country_name || raceData?.country || raceData?.raceName || "Unknown";
      const circuitShortName =
        session?.circuit_short_name ||
        raceData?.circuitName ||
        raceData?.raceName ||
        "Unknown";
      const circuitMeta = {
        countryName,
        circuitShortName,
      };
      const { location: displayLocation, country: displayCountry } =
        getRaceDisplayLabel({
          session,
          raceData,
          circuitMeta,
        });

      const [circuitImage, circuitStats] = await Promise.all([
        getCircuitImageUrl(year, circuitMeta),
        getCircuitStats(year, circuitMeta, { round: roundKey }),
      ]);

      let raceName = raceData?.raceName || session?.location || null;
      if (
        raceName &&
        raceName.replace(/\s+/g, "").replace("GrandPrix", "").length > 12
      ) {
        raceName = raceName.replace("Grand Prix", "GP");
      }

      const sessionDate = session?.date_start || session?.date_end;
      const raceDate = isCurrentSeason
        ? formatRaceWeekendDate(sessionDate || raceData?.raceDate)
        : raceData?.raceDate
        ? raceData.raceDate
        : sessionDate
        ? new Date(sessionDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null;

      return {
        round: roundKey,
        circuitName: circuitShortName,
        country: countryName,
        displayLocation,
        displayCountry,
        raceName,
        raceDate,
        raceTimestamp: raceData?.date || sessionDate || null,
        circuitImage,
        firstGrandPrix: circuitStats.firstGrandPrix,
        numberOfLaps: circuitStats.numberOfLaps,
        circuitLength: circuitStats.circuitLength,
        lapRecord: circuitStats.lapRecord,
        lapRecordBy: circuitStats.lapRecordBy,
        lapRecordOn: circuitStats.lapRecordOn,
        results: raceData?.results || [],
        fastestDriver: raceData?.fastestDriver || null,
        qualifyingResults: qualifyingByRound.get(roundKey)?.results || [],
        sprintResults: sprintByRound.get(roundKey)?.results || [],
        sprintFastestDriver: sprintByRound.get(roundKey)?.fastestDriver || null,
      };
    })
  );

  return {
    props: {
      circuits,
      year,
      availableYears,
      latestAvailableYear,
    },
    revalidate: getSeasonRevalidateSeconds(year),
  };
}

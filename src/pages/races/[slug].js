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
  getSeasonSchedule,
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
      circuits.find((circuit) => !circuit.isCancelled && (!circuit.results || circuit.results.length === 0))
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
        {circuits.map((circuit) => {
          if (circuit.isCancelled) return (
            <div
              className="relative mx-auto w-full max-w-sm text-left cursor-default select-none"
              key={`${circuit.raceTimestamp}-${circuit.circuitName}`}
            >
              <div className="flex absolute right-2 left-2 -top-8 z-10 gap-3 justify-between items-center text-sm">
                <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-0.5 uppercase tracking-[0.25em] text-[0.65rem] text-zinc-500">
                  Cancelled
                </span>
                <span className="text-zinc-600 md:tracking-wide">{circuit.raceDate}</span>
              </div>
              <div className="p-4 rounded-3xl border border-zinc-800 bg-zinc-900">
                <h3 className="mb-2 text-lg line-clamp-1">
                  <span className="font-bold text-zinc-500 uppercase">{circuit.displayLocation}</span>
                  <span className="text-zinc-600">, {circuit.displayCountry}</span>
                </h3>
                <div className="aspect-video rounded-md bg-zinc-800 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(255,255,255,0.015) 12px, rgba(255,255,255,0.015) 24px)" }} />
                  <span className="relative text-zinc-600 text-xs uppercase tracking-[0.25em]">Race Cancelled</span>
                </div>
              </div>
            </div>
          );
          return (
          <button
            type="button"
            className="relative mx-auto w-full max-w-sm text-left group"
            key={`${circuit.raceTimestamp}-${circuit.circuitName}`}
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
          );
        })}
      </div>
      {isModalOpen && (
        <CircuitModal circuit={selectedCircuit} onClose={closeModal} isNextRace={selectedCircuit?.round === nextRaceRound} />
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

  const [availableYears, latestAvailableYear, sessions, raceResultsByRound, qualifyingByRound, sprintByRound, scheduleByRound] =
    await Promise.all([
      getAvailableSeasons(),
      getLatestAvailableSeason(),
      getOpenF1RaceSessions(year),
      getSeasonRaceResults(year),
      getSeasonQualifyingResults(year),
      getSeasonSprintResults(year),
      getSeasonSchedule(year),
    ]);

  if (sessions.length === 0 && raceResultsByRound.size === 0) {
    return {
      notFound: true,
      revalidate: getSeasonRevalidateSeconds(year),
    };
  }

  // Build a lookup of OpenF1 sessions by their race date (YYYY-MM-DD).
  // This lets us match OpenF1 sessions to Jolpica rounds by date instead of
  // by array index — which breaks whenever races are cancelled mid-season
  // (OpenF1 keeps cancelled races, Jolpica removes them, causing index drift).
  const sessionByRaceDate = new Map();
  if (isCurrentSeason) {
    sessions.forEach((s) => {
      const dateKey = (s.date_start || s.date_end || "").slice(0, 10);
      if (dateKey) sessionByRaceDate.set(dateKey, s);
    });
  }

  // Use Jolpica schedule as the canonical round list for the current season.
  // Jolpica already reflects cancellations; OpenF1 may not.
  const roundKeys = isCurrentSeason
    ? new Set([...scheduleByRound.keys()].concat([...raceResultsByRound.keys()]))
    : new Set([...raceResultsByRound.keys()]);

  const circuits = await Promise.all(
    [...roundKeys]
      .sort((left, right) => Number(left) - Number(right))
      .map(async (roundKey) => {
      const raceData = raceResultsByRound.get(roundKey);
      const scheduleEntry = scheduleByRound.get(roundKey);

      // Match OpenF1 session by race date rather than array index
      const jolpicaRaceDate = scheduleEntry?.sessions?.find((s) => s.name === "Race")?.dateTime?.slice(0, 10);
      const session = isCurrentSeason && jolpicaRaceDate
        ? (sessionByRaceDate.get(jolpicaRaceDate) ?? null)
        : null;

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

      let raceName = raceData?.raceName || scheduleEntry?.raceName || session?.location || null;
      if (
        raceName &&
        raceName.replace(/\s+/g, "").replace("GrandPrix", "").length > 12
      ) {
        raceName = raceName.replace("Grand Prix", "GP");
      }

      const sessionDate = session?.date_start || session?.date_end;
      const raceDate = isCurrentSeason
        ? formatRaceWeekendDate(jolpicaRaceDate || sessionDate || raceData?.raceDate)
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
        raceTimestamp: raceData?.date || jolpicaRaceDate || sessionDate || null,
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
        schedule: scheduleEntry?.sessions || [],
      };
    })
  );

  // Find OpenF1 sessions with no matching Jolpica round — these are cancelled races.
  // Jolpica removes them; OpenF1 still has them. We surface them as cancelled cards.
  const matchedRaceDates = new Set(
    [...roundKeys].map((rk) =>
      scheduleByRound.get(rk)?.sessions?.find((s) => s.name === "Race")?.dateTime?.slice(0, 10)
    ).filter(Boolean)
  );
  const cancelledSessions = isCurrentSeason
    ? sessions.filter((s) => {
        const d = (s.date_start || s.date_end || "").slice(0, 10);
        return d && !matchedRaceDates.has(d);
      })
    : [];

  const cancelledCircuits = cancelledSessions.map((s) => {
    const countryName = s.country_name || "Unknown";
    const circuitShortName = s.circuit_short_name || s.location || "Unknown";
    const circuitMeta = { countryName, circuitShortName };
    const { location: displayLocation, country: displayCountry } = getRaceDisplayLabel({
      session: s,
      raceData: null,
      circuitMeta,
    });
    return {
      round: null,
      circuitName: circuitShortName,
      country: countryName,
      displayLocation,
      displayCountry,
      raceDate: formatRaceWeekendDate(s.date_start || s.date_end),
      raceTimestamp: s.date_start || s.date_end || null,
      isCancelled: true,
    };
  });

  // Merge and sort everything by race date
  const allCircuits = [...circuits, ...cancelledCircuits].sort((a, b) => {
    const aTime = a.raceTimestamp ? new Date(a.raceTimestamp).getTime() : Infinity;
    const bTime = b.raceTimestamp ? new Date(b.raceTimestamp).getTime() : Infinity;
    return aTime - bTime;
  });

  return {
    props: {
      circuits: allCircuits,
      year,
      availableYears,
      latestAvailableYear,
    },
    revalidate: getSeasonRevalidateSeconds(year),
  };
}

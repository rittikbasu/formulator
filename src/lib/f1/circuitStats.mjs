import circuitMetadata from "./circuitMetadata.json" assert { type: "json" };
import { parse } from "node-html-parser";

import { CURRENT_YEAR, MIN_SUPPORTED_SEASON } from "./config.mjs";
import { fetchText, headRequestSucceeds } from "./fetch.mjs";
const MODERN_CIRCUIT_IMAGE_MIN_YEAR = 2026;
export const EMPTY_CIRCUIT_STATS = {
  firstGrandPrix: "N/A",
  numberOfLaps: "N/A",
  circuitLength: "N/A",
  lapRecord: "N/A",
  lapRecordBy: "N/A",
  lapRecordOn: "N/A",
};

const CIRCUIT_IMAGE_OVERRIDES = {
  Austin: "USA",
  "Yas Marina Circuit": "Abu_Dhabi",
  "Monte Carlo": "Monaco",
  Imola: "Emilia_Romagna",
  Silverstone: "Great_Britain",
  "Silverstone Circuit": "Great_Britain",
  "United Kingdom": "Great_Britain",
  "Baku City Circuit": "Baku",
};
const MODERN_CIRCUIT_IMAGE_SLUGS = {
  Bahrain: "sakhir",
  Sakhir: "sakhir",
  Jeddah: "jeddah",
  Saudi_Arabia: "jeddah",
  Melbourne: "melbourne",
  Australia: "melbourne",
  Shanghai: "shanghai",
  China: "shanghai",
  Suzuka: "suzuka",
  Japan: "suzuka",
  Miami: "miami",
  Imola: "imola",
  Emilia_Romagna: "imola",
  Monaco: "montecarlo",
  Monte_Carlo: "montecarlo",
  Barcelona: "catalunya",
  Catalunya: "catalunya",
  Spain: "catalunya",
  Montreal: "montreal",
  Canada: "montreal",
  Spielberg: "spielberg",
  Austria: "spielberg",
  Silverstone: "silverstone",
  Great_Britain: "silverstone",
  Spa: "spafrancorchamps",
  Spa_Francorchamps: "spafrancorchamps",
  Belgium: "spafrancorchamps",
  Budapest: "hungaroring",
  Hungary: "hungaroring",
  Hungaroring: "hungaroring",
  Zandvoort: "zandvoort",
  Netherlands: "zandvoort",
  Monza: "monza",
  Italy: "monza",
  Baku: "baku",
  Azerbaijan: "baku",
  Singapore: "singapore",
  Austin: "austin",
  USA: "austin",
  Mexico: "mexicocity",
  Mexico_City: "mexicocity",
  Interlagos: "interlagos",
  Brazil: "interlagos",
  Las_Vegas: "lasvegas",
  Las_Vegas_Strip_Circuit: "lasvegas",
  Qatar: "lusail",
  Lusail: "lusail",
  Abu_Dhabi: "yasmarina",
  Yas_Marina_Circuit: "yasmarina",
};

const CIRCUIT_STATS_SLUGS = {
  Bahrain: "bahrain",
  Bahrain_International_Circuit: "bahrain",
  "Saudi Arabia": "saudi-arabia",
  Jeddah_Corniche_Circuit: "saudi-arabia",
  Australia: "australia",
  Albert_Park_Grand_Prix_Circuit: "australia",
  Japan: "japan",
  Suzuka_Circuit: "japan",
  China: "china",
  Shanghai_International_Circuit: "china",
  Miami: "miami",
  Miami_International_Autodrome: "miami",
  Italy: "italy",
  Autodromo_Nazionale_di_Monza: "italy",
  Monaco: "monaco",
  Circuit_de_Monaco: "monaco",
  Canada: "canada",
  Circuit_Gilles_Villeneuve: "canada",
  Spain: "spain",
  Circuit_de_Barcelona_Catalunya: "spain",
  Austria: "austria",
  Red_Bull_Ring: "austria",
  Great_Britain: "great-britain",
  "Great Britain": "great-britain",
  "United Kingdom": "great-britain",
  UK: "great-britain",
  Silverstone_Circuit: "great-britain",
  Belgium: "belgium",
  Circuit_de_Spa_Francorchamps: "belgium",
  Hungary: "hungary",
  Netherlands: "netherlands",
  Circuit_Park_Zandvoort: "netherlands",
  Azerbaijan: "azerbaijan",
  Baku_City_Circuit: "azerbaijan",
  Singapore: "singapore",
  Marina_Bay_Street_Circuit: "singapore",
  "United States": "united-states",
  USA: "united-states",
  Circuit_of_the_Americas: "united-states",
  Mexico: "mexico",
  Autodromo_Hermanos_Rodriguez: "mexico",
  Brazil: "brazil",
  Autodromo_Jose_Carlos_Pace: "brazil",
  Qatar: "qatar",
  Losail_International_Circuit: "qatar",
  "Abu Dhabi": "abu-dhabi",
  UAE: "abu-dhabi",
  Yas_Marina_Circuit: "abu-dhabi",
  "Las Vegas": "las-vegas",
  Las_Vegas_Strip_Street_Circuit: "las-vegas",
  Emilia_Romagna: "emilia-romagna",
  Autodromo_Enzo_e_Dino_Ferrari: "emilia-romagna",
};

const LEGACY_CIRCUIT_PAGE_SLUGS = {
  UAE: "United_Arab_Emirates",
  Abu_Dhabi: "United_Arab_Emirates",
  Yas_Marina_Circuit: "United_Arab_Emirates",
  UK: "Great_Britain",
  Great_Britain: "Great_Britain",
  USA: "United_States",
};

function stripDiacritics(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeCircuitKey(value) {
  return stripDiacritics(value)
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeStatsKey(value) {
  return stripDiacritics(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeLegacyPageSegment(value) {
  return stripDiacritics(value)
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function buildCircuitStatsKey({ circuitShortName, countryName }) {
  const normalizedCircuitName = normalizeCircuitKey(
    CIRCUIT_IMAGE_OVERRIDES[circuitShortName] || circuitShortName
  );
  const normalizedCountryName = normalizeCircuitKey(countryName);

  return (
    CIRCUIT_STATS_SLUGS[normalizedCircuitName] ||
    CIRCUIT_STATS_SLUGS[countryName] ||
    CIRCUIT_STATS_SLUGS[normalizedCountryName] ||
    normalizeStatsKey(countryName)
  );
}

export function createCircuitMetadataShell({
  minYear = MIN_SUPPORTED_SEASON,
  maxYear = CURRENT_YEAR,
} = {}) {
  const seasons = {};

  for (let year = minYear; year <= maxYear; year += 1) {
    seasons[String(year)] = {
      lastProcessedRound: null,
      lastUpdatedAt: null,
      circuits: {},
    };
  }

  return { seasons };
}

export function normalizeCircuitMetadata(value = {}) {
  const shell = createCircuitMetadataShell();

  for (const [year, seasonValue] of Object.entries(value.seasons || {})) {
    shell.seasons[year] = {
      lastProcessedRound:
        seasonValue?.lastProcessedRound === null ||
        seasonValue?.lastProcessedRound === undefined
          ? null
          : Number(seasonValue.lastProcessedRound),
      lastUpdatedAt: seasonValue?.lastUpdatedAt || null,
      circuits: seasonValue?.circuits || {},
    };
  }

  return shell;
}

function pickStoredCircuitStats(record) {
  if (!record) {
    return EMPTY_CIRCUIT_STATS;
  }

  return {
    firstGrandPrix: record.firstGrandPrix || "N/A",
    numberOfLaps: record.numberOfLaps || "N/A",
    circuitLength: record.circuitLength || "N/A",
    lapRecord: record.lapRecord || "N/A",
    lapRecordBy: record.lapRecordBy || "N/A",
    lapRecordOn: record.lapRecordOn || "N/A",
  };
}

export function getStoredCircuitStatsRecord(
  metadata,
  { year, round, circuitMeta }
) {
  const normalizedMetadata = normalizeCircuitMetadata(metadata);
  const seasonKey = String(year);
  const season = normalizedMetadata.seasons?.[seasonKey];
  const statsKey = buildCircuitStatsKey(circuitMeta);

  if (!season) {
    return Object.entries(normalizedMetadata.seasons || {})
      .sort((left, right) => Number(right[0]) - Number(left[0]))
      .find(([candidateYear, candidateSeason]) => {
        return (
          Number(candidateYear) < Number(seasonKey) &&
          candidateSeason?.circuits?.[statsKey]
        );
      })?.[1]?.circuits?.[statsKey] || null;
  }

  if (round !== undefined && round !== null) {
    const roundString = String(round);
    const recordByRound = Object.values(season.circuits || {}).find(
      (record) => String(record.round) === roundString
    );

    if (recordByRound) {
      return recordByRound;
    }
  }

  if (season.circuits?.[statsKey]) {
    return season.circuits[statsKey];
  }

  return Object.entries(normalizedMetadata.seasons || {})
    .sort((left, right) => Number(right[0]) - Number(left[0]))
    .find(([candidateYear, candidateSeason]) => {
      return (
        Number(candidateYear) < Number(seasonKey) &&
        candidateSeason?.circuits?.[statsKey]
      );
    })?.[1]?.circuits?.[statsKey] || null;
}

export function hasCircuitStatsChanged(existingRecord, nextStats) {
  const existingStats = pickStoredCircuitStats(existingRecord);
  const normalizedNextStats = pickStoredCircuitStats(nextStats);

  return Object.keys(EMPTY_CIRCUIT_STATS).some(
    (field) => existingStats[field] !== normalizedNextStats[field]
  );
}

export function isCircuitStatsUsable(stats) {
  return Object.values(pickStoredCircuitStats(stats)).some(
    (value) => value && value !== "N/A"
  );
}

export function getLatestCompletedRound(raceResultsByRound) {
  const rounds = [...raceResultsByRound.entries()]
    .filter(([, race]) => Array.isArray(race?.results) && race.results.length > 0)
    .sort((left, right) => Number(left[0]) - Number(right[0]));

  if (rounds.length === 0) {
    return null;
  }

  const [round, race] = rounds[rounds.length - 1];
  return { round: String(round), race };
}

export function upsertCircuitStatsRecord(
  metadata,
  { year, round, circuitMeta, stats, updatedAt }
) {
  const normalizedMetadata = normalizeCircuitMetadata(metadata);
  const seasonKey = String(year);
  const roundKey = String(round);
  const statsKey = buildCircuitStatsKey(circuitMeta);
  const season =
    normalizedMetadata.seasons[seasonKey] || {
      lastProcessedRound: null,
      lastUpdatedAt: null,
      circuits: {},
    };

  normalizedMetadata.seasons[seasonKey] = {
    ...season,
    lastProcessedRound: Number(roundKey),
    lastUpdatedAt: updatedAt,
    circuits: {
      ...season.circuits,
      [statsKey]: {
        round: roundKey,
        statsKey,
        countryName: circuitMeta.countryName,
        circuitShortName: circuitMeta.circuitShortName,
        ...pickStoredCircuitStats(stats),
      },
    },
  };

  return normalizedMetadata;
}

export function buildCircuitImageUrls(year, { circuitShortName, countryName }) {
  if (Number(year) >= MODERN_CIRCUIT_IMAGE_MIN_YEAR) {
    const modernKey =
      MODERN_CIRCUIT_IMAGE_SLUGS[normalizeCircuitKey(circuitShortName)] ||
      MODERN_CIRCUIT_IMAGE_SLUGS[normalizeCircuitKey(countryName)] ||
      String(circuitShortName || countryName || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "");

    return {
      primary: `https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000000/common/f1/${year}/track/${year}track${modernKey}detailed.webp`,
      fallback: `https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${(CIRCUIT_IMAGE_OVERRIDES[circuitShortName] || circuitShortName).replace(/\s+/g, "_")}_Circuit.png`,
    };
  }

  const normalizedCircuitName =
    CIRCUIT_IMAGE_OVERRIDES[circuitShortName] ||
    circuitShortName.replace(/\s+/g, "_");
  const normalizedCountryName =
    (CIRCUIT_IMAGE_OVERRIDES[countryName] || countryName).replace(/\s+/g, "_");

  return {
    primary: `https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${normalizedCircuitName}_Circuit.png`,
    fallback: `https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${normalizedCountryName}_Circuit.png`,
  };
}

export async function getCircuitImageUrl(year, circuitMeta, options = {}) {
  const { primary, fallback } = buildCircuitImageUrls(year, circuitMeta);
  const headRequestImpl = options.headRequestImpl || headRequestSucceeds;
  const primaryExists = await headRequestImpl(primary);

  if (primaryExists) {
    return primary;
  }

  const fallbackExists = await headRequestImpl(fallback);
  return fallbackExists ? fallback : primary;
}

export function extractCircuitStatsFromHtml(html) {
  if (!html) {
    return null;
  }

  const root = parse(html);
  const stats = {};
  const normalizedText = root.textContent.replace(/\s+/g, " ").trim();
  const statsBlockMatch = normalizedText.match(
    /Circuit Length\s*([\d.]+)\s*km.*?First Grand Prix\s*(\d{4}).*?Number of Laps\s*(\d+).*?(?:Fastest lap time|Lap Record)\s*(\d+:\d+\.\d+)\s*([A-Za-zÀ-ÿ'. -]+?)\s*\((\d{4})\)(?:.*?Race Distance\s*([\d.]+)\s*km)?/i
  );

  root.querySelectorAll(".f1-stat").forEach((stat) => {
    const labelElement = stat.querySelector(".misc--label");
    const valueElement = stat.querySelector(".f1-bold--stat");

    if (labelElement && valueElement) {
      stats[labelElement.textContent.trim()] = valueElement.textContent.trim();
    }
  });

  if (statsBlockMatch) {
    const circuitLength = Number.parseFloat(
      stats["Circuit Length"] || statsBlockMatch[1]
    );
    const raceDistance = Number.parseFloat(
      stats["Race Distance"] || statsBlockMatch[7]
    );

    return {
      firstGrandPrix: stats["First Grand Prix"] || statsBlockMatch[2],
      numberOfLaps: stats["Number of Laps"] || statsBlockMatch[3],
      circuitLength: Number.isFinite(circuitLength)
        ? circuitLength.toFixed(2)
        : "N/A",
      raceDistance: Number.isFinite(raceDistance)
        ? raceDistance.toFixed(2)
        : "N/A",
      lapRecord: stats["Lap Record"] || statsBlockMatch[4],
      lapRecordBy: statsBlockMatch[5],
      lapRecordOn: statsBlockMatch[6],
    };
  }

  const firstGrandPrix =
    stats["First Grand Prix"] ||
    normalizedText.match(/First Grand Prix\s*(\d{4})/i)?.[1] ||
    "N/A";
  const numberOfLaps =
    stats["Number of Laps"] ||
    normalizedText.match(/Number of Laps\s*(\d+)/i)?.[1] ||
    "N/A";
  const circuitLengthRaw =
    stats["Circuit Length"] ||
    normalizedText.match(/Circuit Length\s*([\d.]+)\s*km/i)?.[1] ||
    null;
  const raceDistanceRaw =
    stats["Race Distance"] ||
    normalizedText.match(/Race Distance\s*([\d.]+)\s*km/i)?.[1] ||
    null;
  const lapRecordSource =
    stats["Lap Record"] ||
    normalizedText.match(
      /(?:Fastest lap time|Lap Record)\s*(\d+:\d+\.\d+)\s*([A-Za-zÀ-ÿ'. -]+?)\s*\((\d{4})\)/i
    );

  if (
    firstGrandPrix === "N/A" &&
    numberOfLaps === "N/A" &&
    !circuitLengthRaw &&
    !raceDistanceRaw &&
    !lapRecordSource
  ) {
    return null;
  }

  const lapRecordMatch = Array.isArray(lapRecordSource)
    ? lapRecordSource
    : lapRecordSource
    ? lapRecordSource.match(/(\d+:\d+\.\d+)\s+(.*?)\s+\((\d{4})\)/)
    : null;
  const circuitLength = Number.parseFloat(circuitLengthRaw);
  const raceDistance = Number.parseFloat(raceDistanceRaw);

  return {
    firstGrandPrix,
    numberOfLaps,
    circuitLength: Number.isFinite(circuitLength)
      ? circuitLength.toFixed(2)
      : "N/A",
    raceDistance: Number.isFinite(raceDistance)
      ? raceDistance.toFixed(2)
      : "N/A",
    lapRecord: lapRecordMatch?.[1] || "N/A",
    lapRecordBy: lapRecordMatch?.[2] || "N/A",
    lapRecordOn: lapRecordMatch?.[3] || "N/A",
  };
}

function buildCircuitStatsUrl(year, { circuitShortName, countryName }) {
  const statsSegment = buildCircuitStatsKey({ circuitShortName, countryName });

  return `https://www.formula1.com/en/racing/${year}/${statsSegment}`;
}

function buildCircuitStatsUrlCandidates(year, { circuitShortName, countryName }) {
  const urls = [buildCircuitStatsUrl(year, { circuitShortName, countryName })];
  const legacySegments = [
    LEGACY_CIRCUIT_PAGE_SLUGS[normalizeCircuitKey(circuitShortName)],
    LEGACY_CIRCUIT_PAGE_SLUGS[countryName],
    LEGACY_CIRCUIT_PAGE_SLUGS[normalizeCircuitKey(countryName)],
    normalizeLegacyPageSegment(circuitShortName),
    normalizeLegacyPageSegment(countryName),
  ].filter(Boolean);

  for (const segment of new Set(legacySegments)) {
    urls.push(`https://www.formula1.com/en/racing/${year}/${segment}.html`);
  }

  return urls;
}

export async function fetchCircuitStatsFromRacePage(
  year,
  circuitMeta,
  options = {}
) {
  const fetchTextImpl = options.fetchTextImpl || fetchText;

  for (const url of buildCircuitStatsUrlCandidates(year, circuitMeta)) {
    try {
      const html = await fetchTextImpl(url);
      const stats = extractCircuitStatsFromHtml(html);

      if (isCircuitStatsUsable(stats)) {
        return stats;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

export async function getCircuitStats(year, circuitMeta, options = {}) {
  const metadata = options.metadata || circuitMetadata;
  const record = getStoredCircuitStatsRecord(metadata, {
    year,
    round: options.round,
    circuitMeta,
  });

  return pickStoredCircuitStats(record);
}

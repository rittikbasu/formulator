import { parse } from "node-html-parser";

import { ARCHIVE_SEASON_REVALIDATE_SECONDS } from "./config.mjs";
import { withCache } from "./cache.mjs";
import { fetchText, headRequestSucceeds } from "./fetch.mjs";
const MODERN_CIRCUIT_IMAGE_MIN_YEAR = 2026;

const CIRCUIT_IMAGE_OVERRIDES = {
  Austin: "USA",
  "Yas Marina Circuit": "Abu_Dhabi",
  "Monte Carlo": "Monaco",
  Imola: "Emilia_Romagna",
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
  "Saudi Arabia": "saudi-arabia",
  Australia: "australia",
  Japan: "japan",
  China: "china",
  Miami: "miami",
  Italy: "italy",
  Monaco: "monaco",
  Canada: "canada",
  Spain: "spain",
  Austria: "austria",
  "Great Britain": "great-britain",
  Belgium: "belgium",
  Hungary: "hungary",
  Netherlands: "netherlands",
  Azerbaijan: "azerbaijan",
  Singapore: "singapore",
  "United States": "united-states",
  Mexico: "mexico",
  Brazil: "brazil",
  Qatar: "qatar",
  "Abu Dhabi": "abu-dhabi",
  "Las Vegas": "las-vegas",
  Emilia_Romagna: "emilia-romagna",
};

function normalizeCircuitKey(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
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
  const normalizedCountryName = countryName.replace(/\s+/g, "_");

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

  root.querySelectorAll(".f1-stat").forEach((stat) => {
    const labelElement = stat.querySelector(".misc--label");
    const valueElement = stat.querySelector(".f1-bold--stat");

    if (labelElement && valueElement) {
      stats[labelElement.textContent.trim()] = valueElement.textContent.trim();
    }
  });

  const normalizedText = root.textContent.replace(/\s+/g, " ").trim();
  const firstGrandPrix =
    stats["First Grand Prix"] ||
    normalizedText.match(/First Grand Prix\s+(\d{4})/i)?.[1] ||
    "N/A";
  const numberOfLaps =
    stats["Number of Laps"] ||
    normalizedText.match(/Number of Laps\s+(\d+)/i)?.[1] ||
    "N/A";
  const circuitLengthRaw =
    stats["Circuit Length"] ||
    normalizedText.match(/Circuit Length\s+([\d.]+)\s*km/i)?.[1] ||
    null;
  const raceDistanceRaw =
    stats["Race Distance"] ||
    normalizedText.match(/Race Distance\s+([\d.]+)\s*km/i)?.[1] ||
    null;
  const lapRecordSource =
    stats["Lap Record"] ||
    normalizedText.match(
      /(?:Fastest lap time|Lap Record)\s+(\d+:\d+\.\d+)\s+(.+?)\s+\((\d{4})\)/i
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
    : lapRecordSource.match(/(\d+:\d+\.\d+)\s+(.*?)\s+\((\d{4})\)/);
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
  const normalizedCircuitName =
    CIRCUIT_IMAGE_OVERRIDES[circuitShortName] ||
    circuitShortName.replace(/\s+/g, "_");
  const statsSegment =
    CIRCUIT_STATS_SLUGS[normalizedCircuitName] ||
    CIRCUIT_STATS_SLUGS[countryName] ||
    countryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return `https://www.formula1.com/en/racing/${year}/${statsSegment}/circuit`;
}

export async function getCircuitStats(year, circuitMeta, options = {}) {
  const cacheKey = `circuit-stats:${year}:${circuitMeta.countryName}:${circuitMeta.circuitShortName}`;
  const loader = async () => {
    const fetchTextImpl = options.fetchTextImpl || fetchText;
    const html = await fetchTextImpl(buildCircuitStatsUrl(year, circuitMeta));
    return extractCircuitStatsFromHtml(html);
  };

  const stats = options.fetchTextImpl
    ? await loader()
    : await withCache(cacheKey, ARCHIVE_SEASON_REVALIDATE_SECONDS * 1000, loader);

  return (
    stats || {
      firstGrandPrix: "N/A",
      numberOfLaps: "N/A",
      circuitLength: "N/A",
      raceDistance: "N/A",
      lapRecord: "N/A",
      lapRecordBy: "N/A",
      lapRecordOn: "N/A",
    }
  );
}

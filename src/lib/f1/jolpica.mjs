import {
  ARCHIVE_SEASON_REVALIDATE_SECONDS,
  CURRENT_SEASON_REVALIDATE_SECONDS,
  CURRENT_YEAR,
  JOLPICA_BASE_URL,
  MIN_SUPPORTED_SEASON,
} from "./config.mjs";
import { withCache } from "./cache.mjs";
import { getDriverImageAsset } from "./driverImages.mjs";
import { fetchJson } from "./fetch.mjs";

function getCacheTtlMs(year) {
  return (Number(year) === CURRENT_YEAR
    ? CURRENT_SEASON_REVALIDATE_SECONDS
    : ARCHIVE_SEASON_REVALIDATE_SECONDS) * 1000;
}

function getStandingsList(payload) {
  return payload?.MRData?.StandingsTable?.StandingsLists?.[0] || null;
}

function getRaceTable(payload) {
  return payload?.MRData?.RaceTable?.Races || [];
}

function formatPosition(position) {
  const numericPosition = Number(position);
  return Number.isFinite(numericPosition) && numericPosition < 10
    ? `0${numericPosition}`
    : String(position || "--");
}

function isClassifiedFinish(result) {
  const positionText = String(result.positionText || "").trim().toUpperCase();
  const status = String(result.status || "").trim();

  if (/^(R|D|E|W|F|N)$/i.test(positionText)) {
    return false;
  }

  if (/retired|disqual|excluded|withdrawn|did not/i.test(status)) {
    return false;
  }

  return true;
}

function normalizeResult(result) {
  const grid = Number.parseInt(result.grid, 10);
  const position = Number.parseInt(result.position, 10);

  return {
    position: String(result.position || "").padStart(2, "0"),
    driver: `${result.Driver.givenName} ${result.Driver.familyName}`,
    driverCode: result.Driver.code,
    constructor: result.Constructor.name,
    points: result.points,
    laps: result.laps,
    status: isClassifiedFinish(result) ? "Finished" : "DNF",
    positionsGained:
      Number.isFinite(grid) && Number.isFinite(position) ? grid - position : 0,
    fastestLapTime: result.FastestLap?.Time?.time || "N/A",
    fastestLapNumber: result.FastestLap?.lap || "N/A",
    gapToLeader: result.Time?.time
      ? result.Time.time.replace("+", "")
      : /Lap|Laps$/i.test(result.status)
      ? result.status.replace("+", "")
      : "N/A",
  };
}

function normalizeQualifyingResult(result) {
  return {
    position: String(result.position || "").padStart(2, "0"),
    driver: `${result.Driver.givenName} ${result.Driver.familyName}`,
    driverCode: result.Driver.code,
    constructor: result.Constructor.name,
    q1: result.Q1 || "N/A",
    q2: result.Q2 || "N/A",
    q3: result.Q3 || "N/A",
  };
}

async function getJolpicaPayload(path, options = {}) {
  const fetchJsonImpl = options.fetchJsonImpl || fetchJson;
  return fetchJsonImpl(`${JOLPICA_BASE_URL}${path}`);
}

export async function getDriverStandings(year, options = {}) {
  const cacheKey = `jolpica:driver-standings:${year}`;
  const loader = async () => {
    const payload = await getJolpicaPayload(
      `/ergast/f1/${year}/driverstandings.json`,
      options
    );
    const standingsList = getStandingsList(payload);
    const standings = standingsList?.DriverStandings || [];

    return standings.map((driverStanding) => {
      const constructorName =
        driverStanding.Constructors?.[0]?.name || "Unknown";
      const driverImage = getDriverImageAsset(
        year,
        {
          givenName: driverStanding.Driver.givenName,
          familyName: driverStanding.Driver.familyName,
        },
        constructorName
      );

      return {
        driverId: driverStanding.Driver.driverId,
        driverCode: driverStanding.Driver.code,
        givenName: driverStanding.Driver.givenName,
        familyName: driverStanding.Driver.familyName,
        position: formatPosition(driverStanding.position),
        points: driverStanding.points,
        constructorName,
        imageUrl: driverImage.url,
        imageVariant: driverImage.variant,
      };
    });
  };

  if (options.fetchJsonImpl) {
    return loader();
  }

  return withCache(cacheKey, getCacheTtlMs(year), loader);
}

export async function getConstructorStandings(year, options = {}) {
  const cacheKey = `jolpica:constructor-standings:${year}`;
  const loader = async () => {
    const payload = await getJolpicaPayload(
      `/ergast/f1/${year}/constructorstandings.json`,
      options
    );
    const standingsList = getStandingsList(payload);
    const standings = standingsList?.ConstructorStandings || [];

    return standings.map((standing) => ({
      constructorId: standing.Constructor.constructorId,
      constructorName: standing.Constructor.name,
      points: standing.points,
      position: formatPosition(standing.position),
    }));
  };

  if (options.fetchJsonImpl) {
    return loader();
  }

  return withCache(cacheKey, getCacheTtlMs(year), loader);
}

export async function getAvailableSeasons(options = {}) {
  const cacheKey = "jolpica:available-seasons";
  const loader = async () => {
    const seasons = [];

    for (let year = CURRENT_YEAR; year >= MIN_SUPPORTED_SEASON; year -= 1) {
      const standings = await getDriverStandings(String(year), options);
      if (standings.length > 0) {
        seasons.push(String(year));
      }
    }

    return seasons;
  };

  if (options.fetchJsonImpl) {
    return loader();
  }

  return withCache(cacheKey, CURRENT_SEASON_REVALIDATE_SECONDS * 1000, loader);
}

export async function getLatestAvailableSeason(options = {}) {
  const seasons = await getAvailableSeasons(options);
  return seasons[0] || String(CURRENT_YEAR);
}

export async function getSeasonRaceResults(year, options = {}) {
  const cacheKey = `jolpica:season-results:${year}`;
  const loader = async () => {
    const fetchJsonImpl = options.fetchJsonImpl || fetchJson;
    const limit = 100;
    let offset = 0;
    let total = null;
    const racesByRound = new Map();

    do {
      const payload = await fetchJsonImpl(
        `${JOLPICA_BASE_URL}/ergast/f1/${year}/results.json?limit=${limit}&offset=${offset}`
      );

      if (!payload) {
        break;
      }

      const raceTable = getRaceTable(payload);
      total = Number(payload?.MRData?.total || 0);

      raceTable.forEach((race) => {
        const round = String(race.round || "");
        const existingRace = racesByRound.get(round) || {
          round,
          raceName: race.raceName,
          circuitName: race.Circuit?.circuitName || race.Circuit?.circuitId || null,
          country: race.Circuit?.Location?.country || null,
          raceDate: race.date
            ? new Date(race.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : null,
          results: [],
          fastestDriver: null,
        };

        (race.Results || []).forEach((result) => {
          const normalized = normalizeResult(result);
          existingRace.results.push(normalized);

          if (result.FastestLap?.rank === "1") {
            existingRace.fastestDriver = normalized.driver;
          }
        });

        existingRace.results.sort(
          (left, right) => Number(left.position) - Number(right.position)
        );
        racesByRound.set(round, existingRace);
      });

      offset += limit;
    } while (total !== null && offset < total);

    return racesByRound;
  };

  if (options.fetchJsonImpl) {
    return loader();
  }

  return withCache(cacheKey, getCacheTtlMs(year), loader);
}

export async function getSeasonQualifyingResults(year, options = {}) {
  const cacheKey = `jolpica:season-qualifying:${year}`;
  const loader = async () => {
    const fetchJsonImpl = options.fetchJsonImpl || fetchJson;
    const limit = 100;
    let offset = 0;
    let total = null;
    const qualifyingByRound = new Map();

    do {
      const payload = await fetchJsonImpl(
        `${JOLPICA_BASE_URL}/ergast/f1/${year}/qualifying.json?limit=${limit}&offset=${offset}`
      );

      if (!payload) {
        break;
      }

      const raceTable = getRaceTable(payload);
      total = Number(payload?.MRData?.total || 0);

      raceTable.forEach((race) => {
        const round = String(race.round || "");
        const existingEntry = qualifyingByRound.get(round) || {
          round,
          results: [],
        };

        (race.QualifyingResults || []).forEach((result) => {
          existingEntry.results.push(normalizeQualifyingResult(result));
        });

        existingEntry.results.sort(
          (left, right) => Number(left.position) - Number(right.position)
        );
        qualifyingByRound.set(round, existingEntry);
      });

      offset += limit;
    } while (total !== null && offset < total);

    return qualifyingByRound;
  };

  if (options.fetchJsonImpl) {
    return loader();
  }

  return withCache(cacheKey, getCacheTtlMs(year), loader);
}

export async function getSeasonSprintResults(year, options = {}) {
  const cacheKey = `jolpica:season-sprint:${year}`;
  const loader = async () => {
    const fetchJsonImpl = options.fetchJsonImpl || fetchJson;
    const limit = 100;
    let offset = 0;
    let total = null;
    const sprintByRound = new Map();

    do {
      const payload = await fetchJsonImpl(
        `${JOLPICA_BASE_URL}/ergast/f1/${year}/sprint.json?limit=${limit}&offset=${offset}`
      );

      if (!payload) {
        break;
      }

      const raceTable = getRaceTable(payload);
      total = Number(payload?.MRData?.total || 0);

      raceTable.forEach((race) => {
        const round = String(race.round || "");
        const existingEntry = sprintByRound.get(round) || {
          round,
          results: [],
          fastestDriver: null,
        };

        (race.SprintResults || []).forEach((result) => {
          const normalized = normalizeResult(result);
          existingEntry.results.push(normalized);

          if (result.FastestLap?.rank === "1") {
            existingEntry.fastestDriver = normalized.driver;
          }
        });

        existingEntry.results.sort(
          (left, right) => Number(left.position) - Number(right.position)
        );
        sprintByRound.set(round, existingEntry);
      });

      offset += limit;
    } while (total !== null && offset < total);

    return sprintByRound;
  };

  if (options.fetchJsonImpl) {
    return loader();
  }

  return withCache(cacheKey, getCacheTtlMs(year), loader);
}

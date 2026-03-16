import {
  ARCHIVE_SEASON_REVALIDATE_SECONDS,
  CURRENT_SEASON_REVALIDATE_SECONDS,
  OPENF1_BASE_URL,
} from "./config.mjs";
import { withCache } from "./cache.mjs";
import { fetchJson } from "./fetch.mjs";

function getCacheTtlMs(year) {
  return (Number(year) === new Date().getFullYear()
    ? CURRENT_SEASON_REVALIDATE_SECONDS
    : ARCHIVE_SEASON_REVALIDATE_SECONDS) * 1000;
}

function sortSessionsByDate(sessions) {
  return [...sessions].sort((left, right) => {
    const leftDate = Date.parse(left.date_start || left.date_end || 0);
    const rightDate = Date.parse(right.date_start || right.date_end || 0);
    return leftDate - rightDate;
  });
}

export async function getOpenF1RaceSessions(year, options = {}) {
  const cacheKey = `openf1:sessions:${year}`;
  const loader = async () => {
    const fetchJsonImpl = options.fetchJsonImpl || fetchJson;
    const sessions = await fetchJsonImpl(
      `${OPENF1_BASE_URL}/sessions?session_name=Race&year=${year}`
    );

    if (!Array.isArray(sessions)) {
      return [];
    }

    return sortSessionsByDate(sessions);
  };

  if (options.fetchJsonImpl) {
    return loader();
  }

  return withCache(cacheKey, getCacheTtlMs(year), loader);
}

export async function getOpenF1SessionKey(year, options = {}) {
  const sessions = await getOpenF1RaceSessions(year, options);
  const lastSession = sessions[sessions.length - 1];

  return lastSession?.session_key ?? null;
}

export async function getOpenF1Drivers(sessionKey, options = {}) {
  if (!sessionKey) {
    return [];
  }

  const cacheKey = `openf1:drivers:${sessionKey}`;
  const loader = async () => {
    const fetchJsonImpl = options.fetchJsonImpl || fetchJson;
    const drivers = await fetchJsonImpl(
      `${OPENF1_BASE_URL}/drivers?session_key=${sessionKey}`
    );

    return Array.isArray(drivers) ? drivers : [];
  };

  if (options.fetchJsonImpl) {
    return loader();
  }

  return withCache(cacheKey, CURRENT_SEASON_REVALIDATE_SECONDS * 1000, loader);
}

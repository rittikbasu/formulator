export const MIN_SUPPORTED_SEASON = 2023;
export const CURRENT_YEAR = new Date().getFullYear();
export const CURRENT_SEASON_REVALIDATE_SECONDS = 5 * 60;
export const ARCHIVE_SEASON_REVALIDATE_SECONDS = Number.MAX_SAFE_INTEGER;
export const DEFAULT_FETCH_TIMEOUT_MS = 5000;

function normalizeBaseUrl(value, fallback) {
  return (value || fallback).replace(/\/$/, "");
}

export const JOLPICA_BASE_URL = normalizeBaseUrl(
  process.env.JOLPICA_BASE_URL,
  "https://api.jolpi.ca"
);

export const OPENF1_BASE_URL = normalizeBaseUrl(
  process.env.OPENF1_BASE_URL,
  "https://api.openf1.org/v1"
);

export const F1_FETCH_TIMEOUT_MS = Number.isFinite(
  Number(process.env.F1_FETCH_TIMEOUT_MS)
)
  ? Number(process.env.F1_FETCH_TIMEOUT_MS)
  : DEFAULT_FETCH_TIMEOUT_MS;

export function isSupportedSeason(year) {
  const numericYear = Number(year);

  return (
    Number.isInteger(numericYear) &&
    numericYear >= MIN_SUPPORTED_SEASON &&
    numericYear <= CURRENT_YEAR
  );
}

export function getSeasonRevalidateSeconds(year) {
  return Number(year) === CURRENT_YEAR
    ? CURRENT_SEASON_REVALIDATE_SECONDS
    : ARCHIVE_SEASON_REVALIDATE_SECONDS;
}

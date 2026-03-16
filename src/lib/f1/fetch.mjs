import { F1_FETCH_TIMEOUT_MS } from "./config.mjs";

const MAX_RETRIES = 2;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfter(headerValue) {
  if (!headerValue) {
    return null;
  }

  const seconds = Number(headerValue);
  if (Number.isFinite(seconds)) {
    return Math.max(seconds * 1000, 0);
  }

  const date = Date.parse(headerValue);
  if (Number.isNaN(date)) {
    return null;
  }

  return Math.max(date - Date.now(), 0);
}

function getRetryDelayMs(response, attempt) {
  const retryAfterMs = parseRetryAfter(response?.headers?.get("retry-after"));
  if (retryAfterMs !== null) {
    return retryAfterMs;
  }

  return 250 * 2 ** attempt;
}

async function request(url, {
  parseAs = "json",
  method = "GET",
  headers,
  body,
  retries = MAX_RETRIES,
  timeoutMs = F1_FETCH_TIMEOUT_MS,
  fallbackValue = null,
  fetchImpl = fetch,
} = {}) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        if (parseAs === "response") {
          return response;
        }

        if (parseAs === "text") {
          return response.text();
        }

        if (response.status === 204) {
          return fallbackValue;
        }

        return response.json();
      }

      if (!RETRYABLE_STATUSES.has(response.status) || attempt === retries) {
        return fallbackValue;
      }

      await sleep(getRetryDelayMs(response, attempt));
    } catch (error) {
      clearTimeout(timeout);

      if (attempt === retries) {
        return fallbackValue;
      }

      await sleep(getRetryDelayMs(null, attempt));
    }
  }

  return fallbackValue;
}

export function fetchJson(url, options = {}) {
  return request(url, { ...options, parseAs: "json", fallbackValue: null });
}

export function fetchText(url, options = {}) {
  return request(url, { ...options, parseAs: "text", fallbackValue: null });
}

export async function headRequestSucceeds(url, options = {}) {
  const response = await request(url, {
    ...options,
    method: "HEAD",
    parseAs: "response",
    fallbackValue: null,
  });

  if (!response?.ok) {
    return false;
  }

  return !response.headers?.get("x-cld-error");
}

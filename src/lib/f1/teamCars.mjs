import { ARCHIVE_SEASON_REVALIDATE_SECONDS } from "./config.mjs";
import { withCache } from "./cache.mjs";
import { headRequestSucceeds } from "./fetch.mjs";

const MODERN_TEAM_CAR_MIN_YEAR = 2026;
const TEAM_CAR_SLUGS = {
  mercedes: [
    "mercedes",
    "mercedes-amg-petronas",
    "mercedes-amg-petronas-formula-one-team",
  ],
  ferrari: ["ferrari", "scuderia-ferrari", "scuderia-ferrari-hp"],
  mclaren: ["mclaren", "mclaren-f1-team", "mclaren-formula-1-team"],
  "aston-martin": [
    "aston-martin",
    "aston-martin-aramco",
    "aston-martin-aramco-formula-one-team",
  ],
  alpine: ["alpine", "alpine-f1-team", "bwt-alpine-f1-team"],
  haas: ["haas", "haas-f1-team", "moneygram-haas-f1-team", "tgr-haas-f1-team"],
  williams: ["williams", "williams-racing", "atlassian-williams-racing"],
  "red-bull": ["red-bull-racing", "red-bull", "oracle-red-bull-racing"],
  rb: [
    "racing-bulls",
    "rb",
    "rb-f1-team",
    "visa-cash-app-rb-f1-team",
    "visa-cash-app-racing-bulls-f1-team",
  ],
  sauber: [
    "audi",
    "audi-revolut",
    "kick-sauber",
    "stake-f1-team-kick-sauber",
    "stake-sauber",
    "sauber",
  ],
  cadillac: ["cadillac", "cadillac-f1-team"],
};
const MODERN_TEAM_CAR_SLUGS = {
  mercedes: ["mercedes"],
  ferrari: ["ferrari"],
  mclaren: ["mclaren"],
  "aston-martin": ["astonmartin"],
  alpine: ["alpine"],
  haas: ["haas"],
  williams: ["williams"],
  "red-bull": ["redbullracing"],
  rb: ["racingbulls"],
  sauber: ["audi"],
  cadillac: ["cadillac"],
};

function slugifyDisplayName(displayName) {
  return String(displayName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugifyModernDisplayName(displayName) {
  return String(displayName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function getCandidateYears(year) {
  const numericYear = Number(year);
  const candidates = [numericYear, numericYear - 1, 2025, 2024, 2023];

  return [...new Set(candidates)].filter((candidate) => candidate >= 2023);
}

function getCandidateSlugs(teamKey, displayName) {
  return [...new Set([slugifyDisplayName(displayName), ...(TEAM_CAR_SLUGS[teamKey] || [])])].filter(Boolean);
}

function getModernCandidateSlugs(teamKey, displayName) {
  return [
    ...new Set([
      slugifyModernDisplayName(displayName),
      ...(MODERN_TEAM_CAR_SLUGS[teamKey] || []),
    ]),
  ].filter(Boolean);
}

function buildLegacyTeamCarUrl(year, slug) {
  return `https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/${year}/${slug}.png.transform/6col-retina/image.png`;
}

function buildModernTeamCarUrl(year, slug) {
  return `https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:${year}:fallback:car:${year}fallbackcarright.webp/v1740000000/common/f1/${year}/${slug}/${year}${slug}carright.webp`;
}

export async function getTeamCarImageUrl(
  { year, teamKey, displayName },
  options = {}
) {
  const cacheKey = `team-car:${year}:${teamKey}:${displayName}`;
  const loader = async () => {
    const headRequestImpl = options.headRequestImpl || headRequestSucceeds;
    const candidateYears = getCandidateYears(year);
    const legacyCandidateSlugs = getCandidateSlugs(teamKey, displayName);
    const modernCandidateSlugs = getModernCandidateSlugs(teamKey, displayName);

    for (const candidateYear of candidateYears) {
      const isModernYear = candidateYear >= MODERN_TEAM_CAR_MIN_YEAR;
      const candidateSlugs = isModernYear
        ? modernCandidateSlugs
        : legacyCandidateSlugs;
      const buildUrl = isModernYear
        ? buildModernTeamCarUrl
        : buildLegacyTeamCarUrl;

      for (const candidateSlug of candidateSlugs) {
        const url = buildUrl(candidateYear, candidateSlug);
        if (await headRequestImpl(url)) {
          return url;
        }
      }
    }

    if (Number(year) >= MODERN_TEAM_CAR_MIN_YEAR) {
      return buildModernTeamCarUrl(
        year,
        modernCandidateSlugs[0] || slugifyModernDisplayName(displayName)
      );
    }

    return buildLegacyTeamCarUrl(
      year,
      legacyCandidateSlugs[0] || slugifyDisplayName(displayName)
    );
  };

  if (options.headRequestImpl) {
    return loader();
  }

  return withCache(cacheKey, ARCHIVE_SEASON_REVALIDATE_SECONDS * 1000, loader);
}

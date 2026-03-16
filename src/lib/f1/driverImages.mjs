import { getCanonicalTeamKey } from "./teamAliases.mjs";

const LEGACY_DRIVER_IMAGE_MAX_YEAR = 2025;
const MODERN_DRIVER_TEAM_SLUGS = {
  mercedes: "mercedes",
  ferrari: "ferrari",
  mclaren: "mclaren",
  "aston-martin": "astonmartin",
  alpine: "alpine",
  haas: "haasf1team",
  williams: "williams",
  "red-bull": "redbullracing",
  rb: "racingbulls",
  sauber: "audi",
  cadillac: "cadillac",
};

function normalizeNameFragment(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function buildLegacyDriverSlug(driver) {
  const firstNamePart = normalizeNameFragment(driver.givenName).slice(0, 3);
  const lastNamePart = normalizeNameFragment(driver.familyName).slice(0, 3);

  return `${firstNamePart}${lastNamePart}01`;
}

function buildModernDriverSlug(driver) {
  const firstNamePart = normalizeNameFragment(driver.givenName).slice(0, 3);
  const lastNamePart = normalizeNameFragment(driver.familyName).slice(0, 3);

  return `${firstNamePart}${lastNamePart}01`;
}

export function buildLegacyDriverImageUrl(year, driver) {
  const driverSlug = buildLegacyDriverSlug(driver);

  return `https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/drivers/${year}/${driverSlug}.png.transform/2col-retina/image.png`;
}

export function buildModernDriverImageUrl(year, driver, constructorName) {
  const teamKey = getCanonicalTeamKey(constructorName);
  const teamSlug = MODERN_DRIVER_TEAM_SLUGS[teamKey] || teamKey;
  const driverSlug = buildModernDriverSlug(driver);

  return `https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:${year}:fallback:driver:${year}fallbackdriverright.webp/v1740000000/common/f1/${year}/${teamSlug}/${driverSlug}/${year}${teamSlug}${driverSlug}right.webp`;
}

export function getDriverImageAsset(year, driver, constructorName) {
  if (Number(year) <= LEGACY_DRIVER_IMAGE_MAX_YEAR) {
    return {
      url: buildLegacyDriverImageUrl(year, driver),
      variant: "legacy",
    };
  }

  return {
    url: buildModernDriverImageUrl(year, driver, constructorName),
    variant: "modern",
  };
}

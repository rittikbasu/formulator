import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  getConstructorStandings,
  getDriverStandings,
  getSeasonRaceResults,
} from "../src/lib/f1/jolpica.mjs";
import {
  buildCircuitImageUrls,
  extractCircuitStatsFromHtml,
  getCircuitStats,
} from "../src/lib/f1/circuitStats.mjs";
import {
  buildLegacyDriverImageUrl,
  buildModernDriverImageUrl,
  getDriverImageAsset,
} from "../src/lib/f1/driverImages.mjs";
import { headRequestSucceeds } from "../src/lib/f1/fetch.mjs";
import { getOpenF1SessionKey } from "../src/lib/f1/openf1.mjs";
import { getTeamCarImageUrl } from "../src/lib/f1/teamCars.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, "fixtures");

function readJsonFixture(name) {
  return JSON.parse(
    fs.readFileSync(path.join(fixturesDir, name), "utf8")
  );
}

function readTextFixture(name) {
  return fs.readFileSync(path.join(fixturesDir, name), "utf8");
}

test("getDriverStandings maps MRData driver standings", async () => {
  const fixture = readJsonFixture("jolpica-driver-standings.json");
  const standings = await getDriverStandings("2025", {
    fetchJsonImpl: async () => fixture,
  });

  assert.equal(standings.length, 2);
  assert.deepEqual(standings[0], {
    driverId: "max_verstappen",
    driverCode: "VER",
    givenName: "Max",
    familyName: "Verstappen",
    position: "01",
    points: "110",
    constructorName: "Red Bull",
    imageUrl:
      "https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/drivers/2025/maxver01.png.transform/2col-retina/image.png",
    imageVariant: "legacy",
  });
});

test("getConstructorStandings maps MRData constructor standings", async () => {
  const fixture = readJsonFixture("jolpica-constructor-standings.json");
  const standings = await getConstructorStandings("2025", {
    fetchJsonImpl: async () => fixture,
  });

  assert.deepEqual(standings, [
    {
      constructorId: "red_bull",
      constructorName: "Red Bull",
      points: "210",
      position: "01",
    },
    {
      constructorId: "ferrari",
      constructorName: "Ferrari",
      points: "160",
      position: "02",
    },
  ]);
});

test("getSeasonRaceResults paginates and groups results by round", async () => {
  const pages = {
    0: readJsonFixture("jolpica-results-page-1.json"),
    100: readJsonFixture("jolpica-results-page-2.json"),
  };

  const results = await getSeasonRaceResults("2025", {
    fetchJsonImpl: async (url) => {
      const offset = new URL(url).searchParams.get("offset");
      return pages[offset];
    },
  });

  assert.equal(results.size, 2);
  assert.equal(results.get("1").results.length, 3);
  assert.equal(results.get("1").fastestDriver, "Lando Norris");
  assert.equal(results.get("1").country, "Bahrain");
  assert.equal(results.get("2").raceName, "Saudi Arabian Grand Prix");
  assert.equal(results.get("2").results[0].gapToLeader, "1:20:11.111");
});

test("getSeasonRaceResults treats lapped classified finishers as finished", async () => {
  const payload = {
    MRData: {
      total: "2",
      RaceTable: {
        Races: [
          {
            round: "2",
            raceName: "Chinese Grand Prix",
            date: "2026-03-29",
            Circuit: {
              circuitName: "Shanghai",
              Location: {
                country: "China",
              },
            },
            Results: [
              {
                position: "9",
                positionText: "9",
                grid: "17",
                points: "2",
                laps: "55",
                status: "Lapped",
                Time: { time: "+11.673" },
                Driver: {
                  givenName: "Carlos",
                  familyName: "Sainz",
                  code: "SAI",
                },
                Constructor: {
                  name: "Williams",
                },
                FastestLap: {
                  lap: "51",
                  rank: "9",
                  Time: { time: "1:37.981" },
                },
              },
              {
                position: "16",
                positionText: "R",
                grid: "8",
                points: "0",
                laps: "45",
                status: "Retired",
                Driver: {
                  givenName: "Max",
                  familyName: "Verstappen",
                  code: "VER",
                },
                Constructor: {
                  name: "Red Bull",
                },
              },
            ],
          },
        ],
      },
    },
  };

  const results = await getSeasonRaceResults("2026", {
    fetchJsonImpl: async () => payload,
  });

  assert.equal(results.get("2").results[0].driver, "Carlos Sainz");
  assert.equal(results.get("2").results[0].status, "Finished");
  assert.equal(results.get("2").results[1].driver, "Max Verstappen");
  assert.equal(results.get("2").results[1].status, "DNF");
});

test("getOpenF1SessionKey returns the latest session key and falls back to null", async () => {
  const sessions = readJsonFixture("openf1-sessions.json");
  const sessionKey = await getOpenF1SessionKey("2025", {
    fetchJsonImpl: async () => sessions,
  });
  const missingSessionKey = await getOpenF1SessionKey("2025", {
    fetchJsonImpl: async () => [],
  });

  assert.equal(sessionKey, 9150);
  assert.equal(missingSessionKey, null);
});

test("driver image helpers use the legacy template through 2025", () => {
  const driver = { givenName: "Charles", familyName: "Leclerc" };

  assert.equal(
    buildLegacyDriverImageUrl("2025", driver),
    "https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/drivers/2025/chalec01.png.transform/2col-retina/image.png"
  );
  assert.deepEqual(getDriverImageAsset("2025", driver, "Ferrari"), {
    url: "https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/drivers/2025/chalec01.png.transform/2col-retina/image.png",
    variant: "legacy",
  });
});

test("driver image helpers use the modern template from 2026 onward", () => {
  const driver = { givenName: "Charles", familyName: "Leclerc" };

  assert.equal(
    buildModernDriverImageUrl("2026", driver, "Ferrari"),
    "https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000000/common/f1/2026/ferrari/chalec01/2026ferrarichalec01right.webp"
  );
  assert.deepEqual(getDriverImageAsset("2026", driver, "Ferrari"), {
    url: "https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000000/common/f1/2026/ferrari/chalec01/2026ferrarichalec01right.webp",
    variant: "modern",
  });
});

test("driver image helpers use current team slugs for 2026 constructors", () => {
  const driver = { givenName: "Max", familyName: "Verstappen" };

  assert.equal(
    buildModernDriverImageUrl("2026", driver, "Red Bull"),
    "https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000000/common/f1/2026/redbullracing/maxver01/2026redbullracingmaxver01right.webp"
  );
});

test("extractCircuitStatsFromHtml parses circuit stats markup", () => {
  const stats = extractCircuitStatsFromHtml(readTextFixture("circuit-stats.html"));

  assert.deepEqual(stats, {
    firstGrandPrix: "2004",
    numberOfLaps: "57",
    circuitLength: "5.41",
    raceDistance: "308.24",
    lapRecord: "1:31.447",
    lapRecordBy: "Pedro de la Rosa",
    lapRecordOn: "2005",
  });
});

test("buildCircuitImageUrls uses the modern 2026 track art template", () => {
  assert.deepEqual(
    buildCircuitImageUrls("2026", {
      countryName: "China",
      circuitShortName: "Shanghai",
    }),
    {
      primary:
        "https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000000/common/f1/2026/track/2026trackshanghaidetailed.webp",
      fallback:
        "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Shanghai_Circuit.png",
    }
  );
});

test("buildCircuitImageUrls uses the official 2026 Catalunya and Spa-Francorchamps slugs", () => {
  assert.equal(
    buildCircuitImageUrls("2026", {
      countryName: "Bahrain",
      circuitShortName: "Bahrain International Circuit",
    }).primary,
    "https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000000/common/f1/2026/track/2026tracksakhirdetailed.webp"
  );

  assert.equal(
    buildCircuitImageUrls("2026", {
      countryName: "Monaco",
      circuitShortName: "Monte Carlo",
    }).primary,
    "https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000000/common/f1/2026/track/2026trackmontecarlodetailed.webp"
  );

  assert.equal(
    buildCircuitImageUrls("2026", {
      countryName: "Spain",
      circuitShortName: "Barcelona",
    }).primary,
    "https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000000/common/f1/2026/track/2026trackcatalunyadetailed.webp"
  );

  assert.equal(
    buildCircuitImageUrls("2026", {
      countryName: "Belgium",
      circuitShortName: "Spa-Francorchamps",
    }).primary,
    "https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000000/common/f1/2026/track/2026trackspafrancorchampsdetailed.webp"
  );

  assert.equal(
    buildCircuitImageUrls("2026", {
      countryName: "Hungary",
      circuitShortName: "Budapest",
    }).primary,
    "https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000000/common/f1/2026/track/2026trackhungaroringdetailed.webp"
  );
});

test("buildCircuitImageUrls uses the Great Britain legacy asset for Silverstone", () => {
  assert.deepEqual(
    buildCircuitImageUrls("2025", {
      countryName: "United Kingdom",
      circuitShortName: "Silverstone",
    }),
    {
      primary:
        "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Great_Britain_Circuit.png",
      fallback:
        "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Great_Britain_Circuit.png",
    }
  );
});

test("getCircuitStats falls back to N/A when the scrape fails", async () => {
  const stats = await getCircuitStats(
    "2025",
    { countryName: "Bahrain", circuitShortName: "Bahrain International Circuit" },
    { fetchTextImpl: async () => null }
  );

  assert.deepEqual(stats, {
    firstGrandPrix: "N/A",
    numberOfLaps: "N/A",
    circuitLength: "N/A",
    raceDistance: "N/A",
    lapRecord: "N/A",
    lapRecordBy: "N/A",
    lapRecordOn: "N/A",
  });
});

test("getTeamCarImageUrl uses the modern template for 2026 team cars", async () => {
  const seenUrls = [];
  const url = await getTeamCarImageUrl(
    { year: "2026", teamKey: "mercedes", displayName: "Mercedes" },
    {
      headRequestImpl: async (candidateUrl) => {
        seenUrls.push(candidateUrl);
        return candidateUrl.includes("/common/f1/2026/mercedes/2026mercedescarright.webp");
      },
    }
  );

  assert.equal(
    url,
    "https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000000/common/f1/2026/mercedes/2026mercedescarright.webp"
  );
  assert.ok(
    seenUrls.some((candidateUrl) =>
      candidateUrl.includes("/common/f1/2026/mercedes/2026mercedescarright.webp")
    )
  );
});

test("getTeamCarImageUrl falls back to a previous season asset when current-season art is missing", async () => {
  const seenUrls = [];
  const url = await getTeamCarImageUrl(
    { year: "2026", teamKey: "mercedes", displayName: "Mercedes" },
    {
      headRequestImpl: async (candidateUrl) => {
        seenUrls.push(candidateUrl);
        return candidateUrl.includes("/2025/mercedes.png");
      },
    }
  );

  assert.equal(
    url,
    "https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/mercedes.png.transform/6col-retina/image.png"
  );
  assert.ok(
    seenUrls.some((candidateUrl) =>
      candidateUrl.includes("/common/f1/2026/mercedes/2026mercedescarright.webp")
    )
  );
  assert.ok(seenUrls.some((candidateUrl) => candidateUrl.includes("/2025/mercedes.png")));
});

test("headRequestSucceeds treats Cloudinary not-found responses as missing assets", async () => {
  const exists = await headRequestSucceeds("https://example.com/real-image.png", {
    fetchImpl: async () => ({
      ok: true,
      headers: {
        get(name) {
          return name === "x-cld-error" ? null : null;
        },
      },
    }),
  });
  const missing = await headRequestSucceeds("https://example.com/missing-image.png", {
    fetchImpl: async () => ({
      ok: true,
      headers: {
        get(name) {
          return name === "x-cld-error" ? "Resource not found" : null;
        },
      },
    }),
  });

  assert.equal(exists, true);
  assert.equal(missing, false);
});

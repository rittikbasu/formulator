import fs from "node:fs/promises";
import path from "node:path";

import {
  CURRENT_YEAR,
  MIN_SUPPORTED_SEASON,
} from "../src/lib/f1/config.mjs";
import {
  fetchCircuitStatsFromRacePage,
  getLatestCompletedRound,
  getStoredCircuitStatsRecord,
  hasCircuitStatsChanged,
  isCircuitStatsUsable,
  normalizeCircuitMetadata,
  upsertCircuitStatsRecord,
  createCircuitMetadataShell,
} from "../src/lib/f1/circuitStats.mjs";
import { getSeasonRaceResults } from "../src/lib/f1/jolpica.mjs";

const METADATA_PATH = path.join(
  process.cwd(),
  "src/lib/f1/circuitMetadata.json"
);

function parseArgs(argv) {
  const args = new Set(argv);

  return {
    bootstrap: args.has("--bootstrap"),
  };
}

async function readCircuitMetadataFile() {
  try {
    const raw = await fs.readFile(METADATA_PATH, "utf8");
    return normalizeCircuitMetadata(JSON.parse(raw));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return createCircuitMetadataShell();
    }

    throw error;
  }
}

async function writeCircuitMetadataFile(metadata) {
  const normalized = normalizeCircuitMetadata(metadata);
  await fs.writeFile(
    METADATA_PATH,
    `${JSON.stringify(normalized, null, 2)}\n`,
    "utf8"
  );
}

function getCompletedRounds(raceResultsByRound) {
  return [...raceResultsByRound.entries()]
    .filter(([, race]) => Array.isArray(race?.results) && race.results.length > 0)
    .sort((left, right) => Number(left[0]) - Number(right[0]))
    .map(([round, race]) => ({
      round: String(round),
      race,
    }));
}

function getLatestRoundTarget(metadata, year, latestCompletedRound) {
  if (!latestCompletedRound) {
    return [];
  }

  const season = metadata.seasons?.[String(year)];
  const existingRecord = getStoredCircuitStatsRecord(metadata, {
    year,
    round: latestCompletedRound.round,
    circuitMeta: {
      countryName: latestCompletedRound.race.country,
      circuitShortName: latestCompletedRound.race.circuitName,
    },
  });

  const hasProcessedLatestRound =
    Number(season?.lastProcessedRound) === Number(latestCompletedRound.round) &&
    isCircuitStatsUsable(existingRecord);

  return hasProcessedLatestRound ? [] : [latestCompletedRound];
}

async function refreshRound(metadata, year, target) {
  const circuitMeta = {
    countryName: target.race.country,
    circuitShortName: target.race.circuitName,
  };
  const stats = await fetchCircuitStatsFromRacePage(year, circuitMeta);

  if (!isCircuitStatsUsable(stats)) {
    throw new Error(
      `Failed to scrape usable circuit stats for ${year} round ${target.round} (${target.race.raceName})`
    );
  }

  const existingRecord = getStoredCircuitStatsRecord(metadata, {
    year,
    round: target.round,
    circuitMeta,
  });
  const updatedMetadata = upsertCircuitStatsRecord(metadata, {
    year,
    round: target.round,
    circuitMeta,
    stats,
    updatedAt: new Date().toISOString(),
  });
  const statsChanged = hasCircuitStatsChanged(existingRecord, stats);
  const processedRoundChanged =
    Number(metadata.seasons?.[String(year)]?.lastProcessedRound) !==
    Number(target.round);

  return {
    metadata: updatedMetadata,
    changed: statsChanged || processedRoundChanged,
  };
}

async function refreshSeason(metadata, year, { bootstrap = false } = {}) {
  const raceResultsByRound = await getSeasonRaceResults(String(year));
  const completedRounds = getCompletedRounds(raceResultsByRound);

  if (completedRounds.length === 0) {
    return {
      metadata,
      changed: false,
    };
  }

  const targets = bootstrap
    ? completedRounds
    : getLatestRoundTarget(
        metadata,
        year,
        getLatestCompletedRound(raceResultsByRound)
      );

  let nextMetadata = metadata;
  let changed = false;

  for (const target of targets) {
    const result = await refreshRound(nextMetadata, year, target);
    nextMetadata = result.metadata;
    changed = changed || result.changed;
  }

  return {
    metadata: nextMetadata,
    changed,
  };
}

async function main() {
  const { bootstrap } = parseArgs(process.argv.slice(2));
  const startingMetadata = await readCircuitMetadataFile();
  let metadata = startingMetadata;
  let changed = false;

  if (bootstrap) {
    for (let year = MIN_SUPPORTED_SEASON; year <= CURRENT_YEAR; year += 1) {
      const result = await refreshSeason(metadata, year, { bootstrap: true });
      metadata = result.metadata;
      changed = changed || result.changed;
    }
  } else {
    const result = await refreshSeason(metadata, CURRENT_YEAR, {
      bootstrap: false,
    });
    metadata = result.metadata;
    changed = result.changed;
  }

  if (!changed) {
    console.log("Circuit stats are already up to date.");
    return;
  }

  await writeCircuitMetadataFile(metadata);
  console.log("Updated circuit stats metadata.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

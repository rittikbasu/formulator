import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import clsx from "clsx";

import Badge from "@/components/Bagde";
import {
  getAvailableSeasons,
  getCanonicalTeamKey,
  getConstructorStandings,
  getDriverStandings,
  getLatestAvailableSeason,
  getOpenF1Drivers,
  getOpenF1SessionKey,
  getSeasonRevalidateSeconds,
  getTeamCarImageUrl,
  isSupportedSeason,
} from "@/lib/f1/index.mjs";

const DEFAULT_TEAM_COLOR = "#71717a";
const DRIVER_HEADSHOT_PLACEHOLDER =
  "https://www.state.gov/wp-content/uploads/2022/09/placeholder-headshot.png";
const DRIVER_AVATAR_LAYOUTS = {
  legacy: "origin-top object-cover object-[50%_0%] scale-[1.24]",
  modern: "origin-top object-cover object-[52%_0%] scale-[1.9]",
};
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function normalizeDriverName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");
}

function getDisplayTeamName(value) {
  if (value === "Red Bull Racing") {
    return "Red Bull";
  }

  if (value === "Haas F1 Team") {
    return "Haas";
  }

  return value;
}

const Teams = ({ teams, year }) => {
  const [selectedTeamKey, setSelectedTeamKey] = useState(null);

  useEffect(() => {
    setSelectedTeamKey(null);
  }, [year]);

  const toggleTeamCard = (teamKey, isInteractive) => {
    if (!isInteractive || typeof window === "undefined") {
      return;
    }

    if (window.matchMedia(HOVER_QUERY).matches) {
      return;
    }

    setSelectedTeamKey((currentTeamKey) =>
      currentTeamKey === teamKey ? null : teamKey
    );
  };

  return (
    <>
      <Head>
        <title>Formulator - All things Formula 1</title>
      </Head>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-8 mb-12 justify-center">
        {teams.map((team, index) => {
          const teamColor = team.teamColor || DEFAULT_TEAM_COLOR;
          const hasDriverDetails = team.drivers.length > 0;
          const isSelected = selectedTeamKey === team.key;

          return (
            <button
              type="button"
              key={team.key}
              className={clsx(
                "group relative mx-auto w-full max-w-sm min-w-[300px] text-left [perspective:1800px]",
                hasDriverDetails ? "cursor-pointer" : "cursor-default"
              )}
              style={{ "--team-color": teamColor }}
              onClick={() => toggleTeamCard(team.key, hasDriverDetails)}
              onKeyDown={(event) => {
                if (!hasDriverDetails) {
                  return;
                }

                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedTeamKey((currentTeamKey) =>
                    currentTeamKey === team.key ? null : team.key
                  );
                }
              }}
              aria-pressed={hasDriverDetails ? isSelected : undefined}
              >
              <div className="absolute -top-6 -left-7 md:-left-8">
                <Badge ranking={index + 1} active={isSelected} />
              </div>
              <div
                className={clsx(
                  "absolute -bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-zinc-800/50 bg-zinc-900 px-8 py-2 text-zinc-200 transition duration-500",
                  "group-hover:text-[var(--team-color)]",
                  isSelected && "text-[var(--team-color)]"
                )}
              >
                {team.points} PTS
              </div>
              <div className="absolute top-1/2 left-1/2 z-0 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--team-color)] blur-3xl"></div>
              <div
                className={clsx(
                  "relative min-h-[250px] w-full rounded-3xl transition-transform delay-0 duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d]",
                  "group-hover:delay-100 group-hover:[transform:rotateY(180deg)]",
                  isSelected && "[transform:rotateY(180deg)]"
                )}
              >
                <div className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-zinc-900 bg-zinc-900/50 shadow-lg backdrop-blur-sm webkit-backdrop-blur [backface-visibility:hidden]">
                  <div className="py-4 text-center">
                    <h2 className="text-xl font-bold text-[var(--team-color)]">
                      {team.displayName}
                    </h2>
                  </div>
                  <div className="flex h-full items-center justify-center px-6 pb-5">
                    <div className="relative z-10 h-[136px] w-full max-w-[318px]">
                      <Image
                        src={team.carImageUrl}
                        className="object-contain"
                        alt={`${team.displayName} team car`}
                        fill
                        sizes="(min-width: 1024px) 318px, (min-width: 768px) 318px, 90vw"
                        unoptimized={true}
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-3xl border border-zinc-900 bg-zinc-900/60 px-8 py-3 shadow-lg backdrop-blur-sm webkit-backdrop-blur [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="absolute top-1/2 left-1/2 z-0 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--team-color)] blur-3xl"></div>
                  <div className="relative flex h-full flex-col justify-between">
                    {team.drivers.map((driver, driverIndex) => (
                      <div
                        key={`${team.key}-${driver.driver_number || driverIndex}`}
                        className="flex-1"
                      >
                        <div className="flex h-full items-center">
                          <div className="self-center">
                            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-950 outline outline-zinc-900">
                              <Image
                                src={
                                  driver.imageUrl ||
                                  driver.headshot_url ||
                                  DRIVER_HEADSHOT_PLACEHOLDER
                                }
                                alt={`${driver.full_name}`}
                                fill
                                sizes="64px"
                                unoptimized={true}
                                className={
                                  DRIVER_AVATAR_LAYOUTS[driver.imageVariant] ||
                                  DRIVER_AVATAR_LAYOUTS.legacy
                                }
                                onError={(event) => {
                                  event.target.src =
                                    driver.headshot_url || DRIVER_HEADSHOT_PLACEHOLDER;
                                }}
                              />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-lg font-bold">
                              {driver.first_name}{" "}
                              <span className="uppercase text-[var(--team-color)]">
                                {driver.last_name}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center">
                              <span className="mr-2 rounded-full bg-zinc-600 px-3 py-1 text-sm font-semibold text-gray-200">
                                #{driver.driver_number}
                              </span>
                              <span className="rounded-full bg-zinc-600 px-3 py-1 text-sm font-semibold text-gray-200">
                                {driver.name_acronym}
                              </span>
                            </div>
                          </div>
                        </div>

                        {driverIndex < team.drivers.length - 1 && (
                          <div className="flex-grow border-b border-zinc-800"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default Teams;

export function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps(context) {
  const year = context.params?.slug;

  if (!isSupportedSeason(year)) {
    return {
      notFound: true,
      revalidate: getSeasonRevalidateSeconds(String(new Date().getFullYear())),
    };
  }

  const [availableYears, latestAvailableYear, sessionKey, standings, driverStandings] =
    await Promise.all([
      getAvailableSeasons(),
      getLatestAvailableSeason(),
      getOpenF1SessionKey(year),
      getConstructorStandings(year),
      getDriverStandings(year),
    ]);

  if (standings.length === 0) {
    return {
      notFound: true,
      revalidate: getSeasonRevalidateSeconds(year),
    };
  }

  const openF1Drivers = await getOpenF1Drivers(sessionKey);
  const standingsDriversByCode = new Map();
  const standingsDriversByName = new Map();

  driverStandings.forEach((driver) => {
    if (driver.driverCode) {
      standingsDriversByCode.set(driver.driverCode, driver);
    }

    standingsDriversByName.set(
      normalizeDriverName(`${driver.givenName} ${driver.familyName}`),
      driver
    );
  });

  const driversByTeamKey = openF1Drivers.reduce((accumulator, driver) => {
    const teamKey = getCanonicalTeamKey(driver.team_name);

    if (!teamKey) {
      return accumulator;
    }

    const existingDrivers = accumulator.get(teamKey) || [];
    const hasDriverAlready = existingDrivers.some(
      (existingDriver) =>
        existingDriver.driver_number === driver.driver_number ||
        existingDriver.full_name === driver.full_name
    );

    if (!hasDriverAlready) {
      accumulator.set(teamKey, [...existingDrivers, driver]);
    }
    return accumulator;
  }, new Map());

  const teams = await Promise.all(standings.map(async (standing) => {
    const teamKey = getCanonicalTeamKey(standing.constructorName);
    const teamDrivers = [...(driversByTeamKey.get(teamKey) || [])].sort(
      (left, right) =>
        Number(left.driver_number || 999) - Number(right.driver_number || 999)
    );
    const displayName = getDisplayTeamName(
      teamDrivers[0]?.team_name || standing.constructorName
    );
    const carImageUrl = await getTeamCarImageUrl({
      year,
      teamKey,
      displayName,
    });

    return {
      key: teamKey,
      displayName,
      carImageUrl,
      drivers: teamDrivers.map((driver) => {
        const matchingStandingDriver =
          standingsDriversByCode.get(driver.name_acronym) ||
          standingsDriversByName.get(
            normalizeDriverName(`${driver.first_name} ${driver.last_name}`)
          );

        return {
          ...driver,
          imageUrl: matchingStandingDriver?.imageUrl || null,
          imageVariant: matchingStandingDriver?.imageVariant || "legacy",
        };
      }),
      points: standing.points,
      teamColor: teamDrivers[0]?.team_colour
        ? `#${teamDrivers[0].team_colour}`
        : DEFAULT_TEAM_COLOR,
    };
  }));

  return {
    props: {
      teams,
      year,
      availableYears,
      latestAvailableYear,
    },
    revalidate: getSeasonRevalidateSeconds(year),
  };
}

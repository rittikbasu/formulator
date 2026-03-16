import Head from "next/head";
import Image from "next/image";

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
  legacy: "object-cover object-[50%_10%] scale-[1.3]",
  modern: "origin-top object-cover object-[52%_0%] scale-[1.9]",
};

function normalizeDriverName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");
}

const Teams = ({ teams, year }) => {
  return (
    <>
      <Head>
        <title>Formulator - All things Formula 1</title>
      </Head>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-8 mb-12 justify-center">
        {teams.map((team, index) => {
          const teamColor = team.teamColor || DEFAULT_TEAM_COLOR;
          const hasDriverDetails = team.drivers.length > 0;

          return (
            <div
              key={team.key}
              className="group max-w-sm mx-auto rounded-3xl shadow-lg backdrop-blur-sm webkit-backdrop-blur bg-zinc-900/50 border border-zinc-900 min-w-[300px] min-h-[250px] flex flex-col justify-between relative w-full"
              style={{ "--team-color": teamColor }}
            >
              <div className="absolute -top-6 -left-7 md:-left-8">
                <Badge ranking={index + 1} />
              </div>
              <div className="absolute -bottom-5 transform -translate-x-1/2 left-1/2 bg-zinc-900 border border-zinc-800/50 py-2 px-8 rounded-xl text-zinc-200 group-hover:text-[var(--team-color)] transition duration-300">
                {team.points} PTS
              </div>
              <div className="absolute z-0 blur-3xl h-16 w-16 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[var(--team-color)]"></div>
              <div className={hasDriverDetails ? "block group-hover:hidden" : "block"}>
                <div className="text-center py-4">
                  <h2 className="font-bold text-xl text-[var(--team-color)]">
                    {team.displayName}
                  </h2>
                </div>
                <div className="flex justify-center items-center h-full px-6 pb-5">
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
              <div
                className={
                  hasDriverDetails
                    ? "hidden group-hover:flex flex-col justify-between h-full px-8 py-2"
                    : "hidden"
                }
              >
                {team.drivers.map((driver, driverIndex) => (
                  <div key={`${team.key}-${driver.driver_number || driverIndex}`} className="flex-1">
                    <div className="flex items-center h-full">
                      <div className="self-center">
                        <div className="relative h-16 w-16 overflow-hidden rounded-full outline outline-zinc-900 bg-zinc-950">
                          <Image
                            src={driver.imageUrl || driver.headshot_url || DRIVER_HEADSHOT_PLACEHOLDER}
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
                        <div className="font-bold text-lg">
                          {driver.first_name}{" "}
                          <span className="uppercase text-[var(--team-color)]">
                            {driver.last_name}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="bg-zinc-600 rounded-full px-3 py-1 text-sm font-semibold text-gray-200 mr-2">
                            #{driver.driver_number}
                          </span>
                          <span className="bg-zinc-600 rounded-full px-3 py-1 text-sm font-semibold text-gray-200">
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
    const displayName = teamDrivers[0]?.team_name || standing.constructorName;
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

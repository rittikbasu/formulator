import Head from "next/head";
import Image from "next/image";
import clsx from "clsx";

import {
  getAvailableSeasons,
  getCanonicalTeamKey,
  getDriverStandings,
  getLatestAvailableSeason,
  getOpenF1Drivers,
  getOpenF1SessionKey,
  getSeasonRevalidateSeconds,
  isSupportedSeason,
} from "@/lib/f1/index.mjs";

const DEFAULT_TEAM_COLOR = "#71717a";
const DRIVER_PLACEHOLDER_URL =
  "https://ik.imagekit.io/zwcfsadeijm/ALL_RACING_VENDORS_ARE_THE_EXACT_SAME_GUY_OMG_CLONING_t3uganMky9_oQYDIA3_j_ahgB5uJzp.webp?updatedAt=1716287153953";
const DRIVER_IMAGE_LAYOUTS = {
  legacy: {
    frameClassName: "-top-2 h-[160px] w-[140px]",
    imageClassName:
      "origin-top object-contain object-left-top translate-x-[-6px] translate-y-[3px] scale-[1.12] md:group-hover:scale-[1.2]",
  },
  modern: {
    frameClassName: "-top-2 h-[162px] w-[134px]",
    imageClassName:
      "origin-top object-cover object-[54%_0%] scale-[1.3] md:group-hover:scale-[1.37]",
  },
};

function normalizeDriverName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");
}

const Drivers = ({ standings }) => {
  return (
    <>
      <Head>
        <title>Formulator - All things Formula 1</title>
      </Head>

      <div className="grid grid-cols-1 gap-10 mt-8 md:grid-cols-2 lg:grid-cols-3 md:gap-14">
        {standings.map((driver) => {
          const teamColor = driver.teamColor || DEFAULT_TEAM_COLOR;
          const imageLayout =
            DRIVER_IMAGE_LAYOUTS[driver.imageVariant] || DRIVER_IMAGE_LAYOUTS.legacy;

          return (
            <div
              className="flex relative items-center mx-auto w-full max-w-sm group"
              key={driver.driverId}
              style={{ "--team-color": teamColor }}
            >
              <div
                className={clsx(
                  "relative z-10 right-6 overflow-hidden shrink-0",
                  imageLayout.frameClassName
                )}
              >
                <Image
                  src={driver.imageUrl}
                  alt={`Headshot of ${driver.givenName} ${driver.familyName}`}
                  fill
                  sizes="140px"
                  unoptimized={true}
                  onError={(event) => {
                    event.target.src =
                      driver.fallbackImageUrl || DRIVER_PLACEHOLDER_URL;
                  }}
                  className={clsx(
                    "will-change-transform transition-transform duration-300",
                    imageLayout.imageClassName
                  )}
                />
              </div>
              <div className="bg-zinc-900/50 webkit-backdrop-blur p-4 rounded-r-3xl border-t border-r border-b border-zinc-900 ml-[-110px] flex-1 pl-[110px] relative">
                <div className="absolute z-0 blur-3xl h-24 w-8 rounded-tl-full rounded-bl-full top-1/2 left-10 transform -translate-y-1/2 bg-[var(--team-color)]"></div>
                <div
                  className="absolute -top-4 -right-4 text-4xl font-bold text-transparent"
                  style={{
                    WebkitTextStroke: "1px #a1a1aa",
                  }}
                >
                  {driver.position}
                </div>
                <h3 className="mb-2 text-lg text-zinc-200">
                  <span className="block text-white">{driver.givenName}</span>
                  <span className="uppercase font-bold text-[var(--team-color)] block">
                    {driver.familyName}
                  </span>
                  <span className="block mt-1 text-sm text-zinc-400">
                    {driver.constructorName}
                  </span>
                </h3>
                <p className="mt-2 text-zinc-400">{driver.points} PTS</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Drivers;

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

  const [availableYears, latestAvailableYear, sessionKey, standings] =
    await Promise.all([
      getAvailableSeasons(),
      getLatestAvailableSeason(),
      getOpenF1SessionKey(year),
      getDriverStandings(year),
    ]);

  if (standings.length === 0) {
    return {
      notFound: true,
      revalidate: getSeasonRevalidateSeconds(year),
    };
  }

  const openF1Drivers = await getOpenF1Drivers(sessionKey);
  const teamColorsByTeamKey = new Map();
  const driversByCode = new Map();
  const driversByName = new Map();

  openF1Drivers.forEach((driver) => {
    const teamKey = getCanonicalTeamKey(driver.team_name);

    if (teamKey && !teamColorsByTeamKey.has(teamKey)) {
      teamColorsByTeamKey.set(teamKey, driver.team_colour);
    }

    if (driver.name_acronym) {
      driversByCode.set(driver.name_acronym, driver);
    }

    driversByName.set(
      normalizeDriverName(`${driver.first_name} ${driver.last_name}`),
      driver
    );
  });

  const standingsWithColors = standings.map((driver) => {
    const teamKey = getCanonicalTeamKey(driver.constructorName);
    const matchingDriver =
      driversByCode.get(driver.driverCode) ||
      driversByName.get(
        normalizeDriverName(`${driver.givenName} ${driver.familyName}`)
      );

    return {
      ...driver,
      teamColor: teamColorsByTeamKey.get(teamKey)
        ? `#${teamColorsByTeamKey.get(teamKey)}`
        : DEFAULT_TEAM_COLOR,
      fallbackImageUrl: matchingDriver?.headshot_url || DRIVER_PLACEHOLDER_URL,
    };
  });

  return {
    props: {
      standings: standingsWithColors,
      availableYears,
      latestAvailableYear,
    },
    revalidate: getSeasonRevalidateSeconds(year),
  };
}

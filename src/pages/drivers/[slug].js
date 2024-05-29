import Head from "next/head";
import Image from "next/image";

import { getSessionKey } from "@/utils/getSessionKey";

const Drivers = ({ standings, year }) => {
  //   console.log(standings);
  return (
    <>
      <Head>
        <title>Formulator - All things Formula 1</title>
      </Head>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14 mt-8">
        {standings &&
          standings.map((driver) => {
            return (
              <div
                className="flex items-center w-full relative group"
                key={driver.driverId}
                style={{ "--team-color": `#${driver.teamColor}` }}
              >
                <div className="relative z-10 right-6 -top-2">
                  <Image
                    src={driver.imageUrl}
                    alt={`Headshot of ${driver.givenName} ${driver.familyName}`}
                    width={160}
                    height={160}
                    unoptimized={true}
                    onError={(e) => {
                      e.target.src =
                        "https://ik.imagekit.io/zwcfsadeijm/ALL_RACING_VENDORS_ARE_THE_EXACT_SAME_GUY_OMG_CLONING_t3uganMky9_oQYDIA3_j_ahgB5uJzp.webp?updatedAt=1716287153953";
                    }}
                    className="rounded-md md:group-hover:scale-110 transition duration-300"
                  />
                </div>
                <div className="bg-zinc-900/50 webkit-backdrop-blur p-4 rounded-r-3xl border-t border-r border-b border-zinc-900 ml-[-110px] flex-1 pl-[110px] relative">
                  <div className="absolute z-0 blur-3xl h-24 w-8 rounded-tl-full rounded-bl-full top-1/2 left-10 transform -translate-y-1/2 bg-[var(--team-color)]"></div>
                  <div
                    className="absolute -top-4 -right-4 text-transparent text-4xl font-bold"
                    style={{
                      WebkitTextStroke: "1px #a1a1aa",
                    }}
                  >
                    {driver.position}
                  </div>
                  <h3 className="text-zinc-200 text-lg mb-2">
                    <span className="text-white block">{driver.givenName}</span>
                    <span className="uppercase font-bold text-[var(--team-color)] block">
                      {driver.familyName}
                    </span>
                    <span className="text-zinc-400 text-sm block mt-1">
                      {driver.constructorName}
                    </span>
                  </h3>
                  <p className="text-zinc-400 mt-2">{driver.points} PTS</p>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default Drivers;

export const getStaticPaths = async () => {
  const years = ["2024", "2023"];
  return {
    paths: years.map((year) => ({
      params: {
        slug: year,
      },
    })),
    fallback: true,
  };
};

export const getStaticProps = async (context) => {
  const { slug } = context.params;
  const sessionKey = await getSessionKey(slug);

  // Fetch driver standings
  const response = await fetch(
    `https://ergast.com/api/f1/${slug}/driverStandings.json`
  );
  const data = await response.json();
  const standings =
    data.MRData.StandingsTable.StandingsLists[0].DriverStandings.map(
      (driver) => {
        const firstNamePart = driver.Driver.givenName.slice(0, 3).toLowerCase();
        const lastNamePart = driver.Driver.familyName.slice(0, 3).toLowerCase();
        const imageUrl = `https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/drivers/${slug}/${firstNamePart}${lastNamePart}01.png.transform/2col-retina/image.png`;

        return {
          driverId: driver.Driver.driverId,
          driverCode: driver.Driver.code,
          givenName: driver.Driver.givenName,
          familyName: driver.Driver.familyName,
          position:
            driver.position < 10 ? `0${driver.position}` : driver.position,
          points: driver.points,
          constructorName: driver.Constructors[0].name,
          imageUrl,
        };
      }
    );

  // Fetch team colors
  const openF1Response = await fetch(
    `https://api.openf1.org/v1/drivers?session_key=${sessionKey}`
  );
  const driversData = await openF1Response.json();

  // Add team colors to the standings
  const standingsWithColors = standings.map((driver) => {
    let constructorName = driver.constructorName
      .toLowerCase()
      .replace(/f1|team/g, "")
      .trim();

    const matchingTeam = driversData.find((team) => {
      return team.team_name.toLowerCase().includes(constructorName);
    });

    const teamColor = matchingTeam ? matchingTeam.team_colour : null;

    return {
      ...driver,
      teamColor,
    };
  });

  return {
    props: { standings: standingsWithColors, year: slug },
    revalidate: 1,
  };
};

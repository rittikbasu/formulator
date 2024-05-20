import Head from "next/head";
import Image from "next/image";

import Selector from "@/components/Selector";
import { getSessionKey } from "@/utils/getSessionKey";

const Drivers = ({ standings, year }) => {
  //   console.log(standings);
  return (
    <>
      <Head>
        <title>Formulator - All things Formula 1</title>
      </Head>
      <Selector year={year} category="drivers" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14 mt-8">
        {standings &&
          standings.map((driver) => {
            const firstNamePart = driver.Driver.givenName
              .slice(0, 3)
              .toLowerCase();
            const lastNamePart = driver.Driver.familyName
              .slice(0, 3)
              .toLowerCase();
            const imageUrl = `https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/drivers/${year}/${firstNamePart}${lastNamePart}01.png.transform/2col-retina/image.png`;
            const formattedPosition =
              driver.position < 10 ? `0${driver.position}` : driver.position;
            return (
              <div
                className="flex items-center w-full relative group"
                key={driver.Driver.driverId}
                style={{ "--team-color": `#${driver.teamColor}` }}
              >
                <div className="relative z-10 right-4 -top-2">
                  <Image
                    src={imageUrl}
                    alt={`${driver.Driver.givenName} ${driver.Driver.familyName}`}
                    width={160}
                    height={160}
                    unoptimized={true}
                    onError={(e) => {
                      e.target.src =
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/991px-Placeholder_view_vector.svg.png";
                    }}
                    className="rounded-md group-hover:scale-110 transition duration-300"
                  />
                </div>
                <div className="bg-zinc-900/50 webkit-backdrop-blur p-4 rounded-r-3xl border border-zinc-900 ml-[-100px] flex-1 pl-[100px] relative">
                  <div className="absolute z-0 blur-3xl h-16 w-16 rounded-full top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-[var(--team-color)]"></div>
                  <div
                    className="absolute -top-4 -right-4 text-transparent text-4xl font-bold"
                    style={{
                      WebkitTextStroke: "1px #a1a1aa",
                    }}
                  >
                    {formattedPosition}
                  </div>
                  <h3 className="text-zinc-200 text-lg mb-2">
                    <span className="text-white block">
                      {driver.Driver.givenName}
                    </span>
                    <span className="uppercase font-bold text-[var(--team-color)] block">
                      {driver.Driver.familyName}
                    </span>
                    <span className="text-zinc-400 text-sm block mt-1">
                      {driver.Constructors[0].name}
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

  const response = await fetch(
    `https://ergast.com/api/f1/${slug}/driverStandings.json`
  );
  const data = await response.json();
  const standings =
    data.MRData.StandingsTable.StandingsLists[0].DriverStandings;

  const openF1Response = await fetch(
    `https://api.openf1.org/v1/drivers?session_key=${sessionKey}`
  );
  const driversData = await openF1Response.json();

  // Add team colors to the standings
  const standingsWithColors = standings.map((driver) => {
    let constructorName = driver.Constructors[0].name
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

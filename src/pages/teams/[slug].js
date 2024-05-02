import Head from "next/head";
import Image from "next/image";

import Selector from "@/components/Selector";
import Badge from "@/components/Bagde";

const Teams = ({ teams, year }) => {
  return (
    <>
      <Head>
        <title>Formulator - All things Formula 1</title>
      </Head>
      <Selector year={year} category="teams" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12 mt-8 justify-center">
        {teams &&
          Object.entries(teams).map(([teamName, teamData], index) => (
            <div
              key={teamName}
              className="group max-w-sm rounded-3xl shadow-lg backdrop-blur-sm webkit-backdrop-blur bg-zinc-900/50 border border-zinc-900 min-w-[300px] min-h-[250px] flex flex-col justify-between relative"
              style={{ "--team-color": `#${teamData.drivers[0].team_colour}` }}
            >
              <div className="absolute -top-6 -left-7 md:-left-8">
                <Badge ranking={index + 1} />
              </div>
              <div className="absolute -bottom-5 transform -translate-x-1/2 left-1/2 bg-zinc-900 border border-zinc-800/50 py-2 px-8 rounded-xl text-zinc-200 group-hover:text-[var(--team-color)] transition duration-300">
                {teamData.points} PTS
              </div>
              <div className="absolute z-0 blur-3xl h-16 w-16 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[var(--team-color)]"></div>
              <div className="block group-hover:hidden">
                {/* Team name */}
                <div className="text-center py-4">
                  <h2 className="font-bold text-xl text-[var(--team-color)]">
                    {teamName}
                  </h2>
                </div>
                {/* Team car image */}
                <div className="flex justify-center items-center h-full">
                  <Image
                    src={`https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/${year}/${teamName
                      .replace(/\s+/g, "-")
                      .toLowerCase()}.png.transform/6col-retina/image.png`}
                    className="w-fit h-fit z-10"
                    alt={`${teamName} team car`}
                    height={200}
                    width={200}
                    unoptimized={true}
                  />
                </div>
              </div>
              {/* Drivers information */}
              <div className="hidden group-hover:flex flex-col justify-between h-full px-8 py-2">
                {teamData.drivers.map((driver, index) => (
                  <div key={index} className="flex-1">
                    <div className="flex justify-between items-center h-full">
                      <div>
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
                      {/* Driver image */}
                      <div className="self-center">
                        <Image
                          src={
                            driver.headshot_url ||
                            "https://www.state.gov/wp-content/uploads/2022/09/placeholder-headshot.png"
                          }
                          alt={`${driver.full_name}`}
                          height={48}
                          width={48}
                          unoptimized={true}
                          className="rounded-full outline outline-zinc-900"
                        />
                      </div>
                    </div>

                    {index < teamData.drivers.length - 1 && (
                      <div className="flex-grow border-b border-zinc-800"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default Teams;

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
  const currentYear = new Date().getFullYear().toString();
  let session_key = "latest";

  if (slug !== currentYear) {
    try {
      const sessionsResponse = await fetch(
        `https://api.openf1.org/v1/sessions?session_name=Race&year=${slug}`
      );
      const sessionsData = await sessionsResponse.json();
      const lastSession = sessionsData[sessionsData.length - 1];
      session_key = lastSession.session_key;
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  }

  let standings = [];
  try {
    const standingsResponse = await fetch(
      `http://ergast.com/api/f1/${slug}/constructorStandings.json`
    );
    const standingsData = await standingsResponse.json();
    standings =
      standingsData.MRData.StandingsTable.StandingsLists[0]
        .ConstructorStandings;
  } catch (error) {
    console.error("Error fetching constructor standings:", error);
  }

  let teams = {};
  try {
    const driversResponse = await fetch(
      `https://api.openf1.org/v1/drivers?session_key=${session_key}`
    );
    const driversData = await driversResponse.json();
    teams = driversData.reduce((acc, driver) => {
      (acc[driver.team_name] = acc[driver.team_name] || []).push(driver);
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching drivers data:", error);
  }

  // Match and sort teams based on constructor standings
  const sortedTeams = standings.reduce((acc, standing) => {
    let constructorName = standing.Constructor.name.toLowerCase();
    constructorName = constructorName.replace(/f1|team/g, "").trim();
    const matchingTeamKey = Object.keys(teams).find((teamName) => {
      return teamName.toLowerCase().includes(constructorName);
    });
    if (matchingTeamKey) {
      acc[matchingTeamKey] = {
        drivers: teams[matchingTeamKey],
        points: standing.points,
      };
    }
    return acc;
  }, {});

  return {
    props: { teams: sortedTeams, year: slug },
    revalidate: 1,
  };
};

import React, { useEffect, useState } from "react";
import Image from "next/image";

const Drivers = () => {
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  useEffect(() => {
    setLoading(true);
    if (selectedYear === currentYear) {
      fetchDriversData("latest");
    } else {
      fetch(
        `https://api.openf1.org/v1/sessions?session_name=Race&year=${selectedYear}`
      )
        .then((response) => response.json())
        .then((sessionsData) => {
          const lastSession = sessionsData[sessionsData.length - 1];
          const sessionKey = lastSession.session_key;
          const countryName = lastSession.country_name;
          return fetchDriversData(sessionKey);
        })
        .catch((error) => {
          console.error("Error fetching session data:", error);
          setLoading(false);
        });
    }
  }, [selectedYear, currentYear]);

  function fetchDriversData(sessionKey) {
    fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`)
      .then((response) => response.json())
      .then((driversData) => {
        console.log(driversData);
        const groupedByTeam = driversData.reduce((acc, driver) => {
          (acc[driver.team_name] = acc[driver.team_name] || []).push(driver);
          return acc;
        }, {});
        const sortedTeams = Object.keys(groupedByTeam)
          .sort()
          .reduce((acc, key) => {
            acc[key] = groupedByTeam[key];
            return acc;
          }, {});
        setTeams(sortedTeams);
      })
      .catch((error) => {
        console.error("Error fetching drivers data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const SkeletonCard = () => (
    <div className="max-w-sm rounded-3xl overflow-hidden shadow-lg m-4 bg-zinc-900/50 border border-zinc-900 min-w-[300px] min-h-[200px] animate-pulse"></div>
  );

  return (
    <div>
      <div className="flex justify-center md:my-16 my-8">
        <Image
          src="https://logodownload.org/wp-content/uploads/2016/11/formula-1-logo-7.png"
          alt="F1 logo"
          height={100}
          width={200}
          unoptimized={true}
        />
      </div>

      <div className="max-w-sm mx-auto p-8">
        <div className="flex">
          <label htmlFor="year" className="sr-only">
            Choose a year
          </label>
          <select
            id="year"
            className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center rounded-s-xl bg-zinc-900 border border-zinc-800 outline-none"
            defaultValue="2024"
            onChange={handleYearChange}
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
            <option value="2019">2019</option>
          </select>
          <label htmlFor="teams" className="sr-only">
            Choose a team
          </label>
          <select
            id="teams"
            className="bg-zinc-900 block w-full p-2.5 text-sm rounded-e-xl border-y border-r border-zinc-800 outline-none"
            defaultValue="Teams"
          >
            <option value="teams">Teams</option>
            <option value="races">Races</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 md:mx-16 mx-4 justify-center">
        {loading
          ? Array.from({ length: 10 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : Object.entries(teams).map(([teamName, drivers]) => (
              <div
                key={teamName}
                className="group max-w-sm rounded-3xl overflow-hidden shadow-lg m-4 bg-zinc-900/50 border border-zinc-900 min-w-[300px] min-h-[200px] flex flex-col justify-between relative"
              >
                <div
                  className="absolute z-0 blur-3xl h-16 w-16 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    backgroundColor: `#${drivers[0].team_colour}`,
                  }}
                ></div>
                <div className="group-hover:hidden block ">
                  {/* Team name */}
                  <div className="text-center py-4">
                    <h2
                      className="font-bold text-xl"
                      style={{ color: `#${drivers[0].team_colour}` }}
                    >
                      {teamName}
                    </h2>
                  </div>
                  {/* Team car image */}
                  <div className="flex justify-center items-center h-full">
                    <Image
                      src={`https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/${selectedYear}/${teamName
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
                <div className="hidden group-hover:flex flex-col items-stretch justify-center h-full px-8 gap-y-4 transition-opacity duration-700 ease-in-out">
                  {drivers.map((driver, index) => (
                    <div key={index} className="">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-bold text-lg mb-2">
                            {driver.first_name}{" "}
                            <span
                              style={{ color: `#${driver.team_colour}` }}
                              className="uppercase"
                            >
                              {driver.last_name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-zinc-600 rounded-full px-3 py-1 text-sm font-semibold text-gray-200 mr-2">
                              #{driver.driver_number}
                            </span>
                            <span className="bg-zinc-600 rounded-full px-3 py-1 text-sm font-semibold text-gray-200">
                              {driver.name_acronym}
                            </span>
                          </div>
                        </div>
                        {/* Driver image */}
                        <div className="self-start">
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
                    </div>
                  ))}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default Drivers;

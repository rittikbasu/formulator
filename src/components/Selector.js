import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const Selector = ({ year, category }) => {
  const [selectedYear, setSelectedYear] = useState(year);
  const [option, setOption] = useState(category);
  const router = useRouter();

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleOptionChange = (e) => {
    setOption(e.target.value);
  };

  useEffect(() => {
    if (option && selectedYear) {
      if (option === "teams") {
        router.push(`/teams/${selectedYear}`);
      } else if (option === "races") {
        router.push(`/races/${selectedYear}`);
      }
    }
  }, [option, selectedYear]);
  return (
    <div className="max-w-sm mx-auto md:pb-16 py-8 px-1">
      <div className="flex text-zinc-300">
        <label htmlFor="year" className="sr-only">
          Choose a year
        </label>
        <select
          id="year"
          className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center rounded-s-xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 outline-none"
          defaultValue={year}
          onChange={handleYearChange}
        >
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option disabled value="2022">
            2022 🔜
          </option>
          <option disabled value="2021">
            2021 🔜
          </option>
          <option disabled value="2020">
            2020 🔜
          </option>
          <option disabled value="2019">
            2019 🔜
          </option>
        </select>
        <label htmlFor="teams" className="sr-only">
          Choose a team
        </label>
        <select
          id="teams"
          className="bg-zinc-900/80 backdrop-blur-sm block w-full p-2.5 text-sm rounded-e-xl border-y border-r border-zinc-800 outline-none"
          defaultValue={category}
          onChange={handleOptionChange}
        >
          <option value="teams">Teams</option>
          <option value="races">Races</option>
        </select>
      </div>
    </div>
  );
};

export default Selector;

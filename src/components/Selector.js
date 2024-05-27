import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const Selector = ({ year, category }) => {
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const router = useRouter();

  const handleYearChange = (e) => {
    console.log(e.target.value);
    setSelectedYear(e.target.value);
  };

  const handleOptionChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  useEffect(() => {
    if (selectedCategory && selectedYear) {
      if (selectedCategory === "teams") {
        router.push(`/teams/${selectedYear}`);
      } else if (selectedCategory === "races") {
        router.push(`/races/${selectedYear}`);
      } else if (selectedCategory === "drivers") {
        router.push(`/drivers/${selectedYear}`);
      }
    }
  }, [selectedCategory, selectedYear]);

  return (
    <div className="max-w-sm mx-auto md:pb-16 py-8 px-1">
      <div className="relative grid grid-cols-2 gap-1 text-zinc-300 bg-zinc-900/60 backdrop-blur-sm webkit-backdrop-blur border border-zinc-900 rounded-xl">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-px bg-zinc-900 self-stretch"></div>
        </div>

        <select
          id="year"
          className="appearance-none bg-transparent py-2.5 text-sm font-medium text-center outline-none w-full z-10 hover:text-red-500 cursor-pointer"
          defaultValue={year}
          onChange={handleYearChange}
          style={{ textAlignLast: "center", WebkitAppearance: "none" }} // Ensures centering in Safari
        >
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option disabled value="2022">
            2022
          </option>
          <option disabled value="2021">
            2021
          </option>
          <option disabled value="2020">
            2020
          </option>
          <option disabled value="2019">
            2019
          </option>
        </select>

        <select
          id="category"
          className="appearance-none bg-transparent py-2.5 text-sm font-medium text-center outline-none w-full z-10 hover:text-red-500 cursor-pointer"
          defaultValue={category}
          onChange={handleOptionChange}
          style={{ textAlignLast: "center", WebkitAppearance: "none" }} // Ensures centering in Safari
        >
          <option value="teams">Teams</option>
          <option value="drivers">Drivers</option>
          <option value="races">Races</option>
        </select>
      </div>
    </div>
  );
};

export default Selector;

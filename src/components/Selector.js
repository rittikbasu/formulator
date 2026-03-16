import { useMemo } from "react";
import { useRouter } from "next/router";

function getCategoryFromPath(pathname) {
  if (pathname.startsWith("/drivers")) {
    return "drivers";
  }

  if (pathname.startsWith("/races")) {
    return "races";
  }

  return "teams";
}

const Selector = ({ availableYears, latestAvailableYear }) => {
  const router = useRouter();
  const yearOptions = useMemo(
    () => availableYears.filter(Boolean),
    [availableYears]
  );
  const defaultYear = yearOptions[0] || latestAvailableYear;
  const selectedYear =
    router.isReady && typeof router.query.slug === "string"
      ? router.query.slug
      : defaultYear;
  const selectedCategory = getCategoryFromPath(router.pathname);

  const navigateTo = (category, year) => {
    if (!router.isReady || !category || !year) {
      return;
    }

    const targetPath = `/${category}/${year}`;

    if (router.asPath === targetPath) {
      return;
    }

    router.push(targetPath);
  };

  return (
    <div className="max-w-sm mx-auto md:pb-16 pt-4 px-8">
      <div className="relative grid grid-cols-2 gap-1 text-zinc-300 bg-zinc-900/60 webkit-backdrop-blur-lg border border-zinc-800/60 rounded-xl">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-px bg-zinc-800/60 self-stretch"></div>
        </div>

        <select
          id="year"
          className="appearance-none bg-transparent py-2 text-sm md:text-base font-medium text-center outline-none w-full z-10 hover:text-red-500 cursor-pointer"
          value={selectedYear}
          onChange={(event) =>
            navigateTo(selectedCategory, event.target.value)
          }
          style={{ textAlignLast: "center", WebkitAppearance: "none" }}
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          id="category"
          className="appearance-none bg-transparent py-2 text-sm md:text-base font-medium text-center outline-none w-full z-10 hover:text-red-500 cursor-pointer"
          value={selectedCategory}
          onChange={(event) =>
            navigateTo(event.target.value, selectedYear)
          }
          style={{ textAlignLast: "center", WebkitAppearance: "none" }}
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

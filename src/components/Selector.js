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
    <div className="px-8 pt-4 mx-auto max-w-sm sm:pb-4">
      <div className="grid relative grid-cols-2 gap-1 rounded-xl border text-zinc-300 bg-zinc-900/60 webkit-backdrop-blur-lg border-zinc-800/60">
        <div className="flex absolute inset-0 justify-center">
          <div className="self-stretch w-px bg-zinc-800/60"></div>
        </div>

        <select
          id="year"
          className="z-10 py-2 w-full text-sm font-medium text-center bg-transparent appearance-none cursor-pointer outline-none md:text-base hover:text-red-500"
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
          className="z-10 py-2 w-full text-sm font-medium text-center bg-transparent appearance-none cursor-pointer outline-none md:text-base hover:text-red-500"
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

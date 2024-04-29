import Head from "next/head";
import Image from "next/image";

import Selector from "@/components/Selector";

const Drivers = ({ circuits, year }) => {
  const SkeletonCard = () => (
    <div className="max-w-sm rounded-3xl overflow-hidden shadow-lg m-4 backdrop-blur-sm bg-zinc-900/50 border border-zinc-900 min-w-[300px] min-h-[250px] animate-pulse"></div>
  );

  return (
    <>
      <Head>
        <title>Formulator - All things Formula 1</title>
      </Head>
      <Selector year={year} category="races" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {Object.entries(circuits).map(
          ([circuitName, [countryName, imageUrl]]) => (
            <div key={circuitName} className="max-w-sm mx-auto relative group">
              <div className="absolute z-0 blur-3xl h-20 w-20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-1000 bg-red-500 group-hover:bg-blue-500"></div>
              <div className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-3xl border border-zinc-900 group-hover:border-red-900 transition duration-300">
                <h3 className="text-zinc-200 text-lg mb-2">
                  <span className="uppercase font-bold text-red-500">
                    {circuitName}
                  </span>
                  , {countryName}
                </h3>
                <Image
                  src={imageUrl}
                  alt={`${circuitName} Circuit`}
                  width={400}
                  height={225}
                  unoptimized={true}
                  onError={(e) => {
                    e.target.src =
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/991px-Placeholder_view_vector.svg.png";
                  }}
                  className="rounded-md"
                />
              </div>
            </div>
          )
        )}
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
  let circuits = {};
  const response = await fetch(
    `https://api.openf1.org/v1/sessions?session_name=Race&year=${slug}`
  );
  const sessionsData = await response.json();

  const fetchPromises = sessionsData.map((session) => {
    const countryName =
      session.country_name === "United Arab Emirates"
        ? "UAE"
        : session.country_name;
    let circuitName = session.circuit_short_name;

    const circuitNameOverrides = {
      Austin: "USA",
      "Yas Marina Circuit": "Abu_Dhabi",
      "Monte Carlo": "Monoco",
    };

    circuitName =
      circuitNameOverrides[circuitName] || circuitName.replace(/\s+/g, "_");

    const circuitImageUrl = `https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${circuitName}_Circuit.png`;
    const countryImageUrl = `https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${countryName.replace(
      /\s+/g,
      "_"
    )}_Circuit.png`;

    // Return a promise that resolves to either the circuit or country image URL
    return fetch(circuitImageUrl, { method: "HEAD" })
      .then((response) => (response.ok ? circuitImageUrl : countryImageUrl))
      .catch(() => countryImageUrl)
      .then((imageUrl) => ({
        [session.circuit_short_name]: [countryName, imageUrl],
      }));
  });

  const results = await Promise.all(fetchPromises);
  circuits = results.reduce((acc, result) => ({ ...acc, ...result }), {});

  return {
    props: { circuits: circuits, year: slug },
    revalidate: 1,
  };
};

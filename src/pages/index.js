import { getLatestAvailableSeason } from "@/lib/f1/index.mjs";

const Home = () => null;

export default Home;

export async function getServerSideProps() {
  const latestAvailableSeason = await getLatestAvailableSeason();

  return {
    redirect: {
      destination: `/teams/${latestAvailableSeason}`,
      permanent: false,
    },
  };
}

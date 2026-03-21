import Head from "next/head";

const BASE_URL = "https://formulator.rittik.io";
const OG_IMAGE = "/og-image.png";

export default function Meta({ title, description, path }) {
  const url = `${BASE_URL}${path}`;
  return (
    <Head>
      <title key="title">{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Formulator" />
      <meta property="og:image" content={OG_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Head>
  );
}

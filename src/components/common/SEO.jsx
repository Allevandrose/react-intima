import { Helmet } from "react-helmet-async";

const SEO = ({
  title,
  description,
  keywords = "",
  image = "/favicon.svg",
  url = "",
  type = "website",
  noIndex = false,
  schema = null,
}) => {
  const siteName = "Intimacare Kenya";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const baseUrl = "https://intimacare.co.ke";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${baseUrl}${image}`} />
      <meta property="og:url" content={`${baseUrl}${url}`} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${baseUrl}${image}`} />

      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow" />}

      <link rel="canonical" href={`${baseUrl}${url}`} />

      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
};

export default SEO;

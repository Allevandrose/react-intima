// Category SEO data
export const categorySEO = {
  vibrators: {
    title: "Vibrators for Women - Premium Pleasure Toys in Kenya",
    description:
      "Shop the best vibrators in Kenya including rabbit, bullet, wand, and G-spot vibrators. Discreet delivery across Nairobi, Mombasa, Kisumu.",
    keywords:
      "vibrators Kenya, rabbit vibrator, bullet vibrator, wand massager, G-spot vibrator, clitoral stimulator",
  },
  dildos: {
    title: "Dildos - Realistic & Silicone Dildos for Sale in Kenya",
    description:
      "Explore our collection of realistic, silicone, and glass dildos. Body-safe materials with discreet shipping in Kenya.",
    keywords:
      "dildos Kenya, realistic dildo, silicone dildo, strap-on, glass dildo",
  },
  "male-toys": {
    title: "Male Masturbators & Sex Toys for Men in Kenya",
    description:
      "Discover male pleasure products including masturbators, penis pumps, cock rings, and prostate massagers. Discreet delivery in Kenya.",
    keywords:
      "male masturbators Kenya, Fleshlight, penis pump, cock ring, prostate massager, stroker",
  },
  couples: {
    title: "Couples Sex Toys - Enhance Intimacy in Kenya",
    description:
      "Shop couples vibrators, remote control toys, and intimacy kits. Perfect for spicing up relationships. Discreet delivery Kenya.",
    keywords:
      "couples sex toys, remote control vibrator, couples vibrator, sex games for couples, intimacy kit",
  },
  anal: {
    title: "Anal Toys - Butt Plugs & Anal Beads in Kenya",
    description:
      "Quality anal toys including butt plugs, anal beads, and prostate massagers. Body-safe silicone with discreet Kenya delivery.",
    keywords:
      "anal toys Kenya, butt plug, anal beads, prostate stimulator, anal training",
  },
  bdsm: {
    title: "BDSM & Bondage Gear for Adults in Kenya",
    description:
      "Explore bondage kits, handcuffs, blindfolds, and BDSM accessories. Discreet packaging across Kenya.",
    keywords:
      "BDSM Kenya, bondage kit, handcuffs, blindfolds, BDSM accessories, roleplay",
  },
  lubricants: {
    title: "Lubricants & Sexual Enhancers in Kenya",
    description:
      "Water-based, silicone, and flavored lubricants. Arousal gels, delay sprays, and libido enhancers. Discreet delivery.",
    keywords:
      "lubricants Kenya, water-based lube, silicone lubricant, flavored lube, arousal gel, delay spray",
  },
  lingerie: {
    title: "Sexy Lingerie - Lace, Babydolls & Bodystockings in Kenya",
    description:
      "Shop sexy lingerie including lace babydolls, bodystockings, and plus size options. Discreet delivery across Kenya.",
    keywords:
      "lingerie Kenya, sexy lingerie, lace babydoll, bodystocking, plus size lingerie",
  },
};

// Generate product schema
export const generateProductSchema = (product) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description?.substring(0, 150) || "",
  image: product.images?.[0] || "",
  brand: {
    "@type": "Brand",
    name: product.brand || "Intimacare",
  },
  offers: {
    "@type": "Offer",
    price: product.price,
    priceCurrency: "KES",
    availability: product.inStock ? "InStock" : "OutOfStock",
    url: `https://intimacare.co.ke/product/${product.slug || product.id}`,
  },
});

// Generate category schema
export const generateCategorySchema = (category, products = []) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: category.name,
  description:
    category.description || `Shop ${category.name} at Intimacare Kenya`,
  url: `https://intimacare.co.ke/category/${category.slug}`,
  numberOfItems: products.length,
  about: {
    "@type": "Thing",
    name: category.name,
  },
});

// Get keywords for category
export const getCategoryKeywords = (categorySlug) => {
  const data = categorySEO[categorySlug];
  return data
    ? data.keywords
    : "adult toys Kenya, sex toys Nairobi, discreet delivery";
};

// Get meta for category
export const getCategoryMeta = (categorySlug) => {
  const data = categorySEO[categorySlug];
  return (
    data || {
      title: "Shop Adult Toys in Kenya",
      description:
        "Premium adult toys and sexual wellness products with discreet delivery across Kenya.",
      keywords: "adult toys Kenya, sex toys Nairobi, discreet delivery",
    }
  );
};

// Get location keywords
export const getLocationKeywords = (city = "Kenya") => {
  const locations = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];
  return locations.map((loc) => `adult toys ${loc}`).join(", ");
};

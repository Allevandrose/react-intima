import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  console.log("🔄 Generating sitemap...");

  try {
    // Get base URL from environment
    const API_URL =
      process.env.VITE_API_URL || "https://adult-novelty.onrender.com/api";
    const SITE_URL = "https://intimacare.co.ke";

    const sitemap = new SitemapStream({ hostname: SITE_URL });

    // Static routes
    const staticRoutes = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      { url: "/shop", changefreq: "daily", priority: 0.9 },
      { url: "/cart", changefreq: "weekly", priority: 0.5 },
    ];

    staticRoutes.forEach((route) => {
      sitemap.write(route);
    });

    console.log("📦 Fetching categories...");
    const categoriesRes = await axios.get(`${API_URL}/categories`);
    const categories = categoriesRes.data.data || [];

    categories.forEach((cat) => {
      sitemap.write({
        url: `/category/${cat.slug}`,
        changefreq: "weekly",
        priority: 0.8,
      });
    });
    console.log(`✅ Added ${categories.length} categories`);

    console.log("📦 Fetching products...");
    const productsRes = await axios.get(`${API_URL}/products?limit=1000`);
    const products = productsRes.data.data || [];

    products.forEach((product) => {
      sitemap.write({
        url: `/product/${product.slug}`,
        changefreq: "weekly",
        priority: 0.7,
      });
    });
    console.log(`✅ Added ${products.length} products`);

    sitemap.end();

    const data = await streamToPromise(sitemap);

    // Write to public folder
    const outputPath = path.join(__dirname, "../public/sitemap.xml");
    const writeStream = createWriteStream(outputPath);
    writeStream.write(data.toString());
    writeStream.end();

    console.log(`✅ Sitemap generated: ${outputPath}`);
    console.log(
      `📊 Total URLs: ${staticRoutes.length + categories.length + products.length}`,
    );
  } catch (error) {
    console.error("❌ Error generating sitemap:", error.message);
    process.exit(1);
  }
}

generateSitemap();

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../redux/slices/categoriesSlice";
import { fetchProducts } from "../redux/slices/productsSlice";

const Sitemap = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.categories);
  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({ limit: 1000 }));
  }, [dispatch]);

  const buildSitemap = () => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://intimacare.co.ke/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>https://intimacare.co.ke/shop</loc>
    <priority>0.9</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>https://intimacare.co.ke/cart</loc>
    <priority>0.5</priority>
    <changefreq>weekly</changefreq>
  </url>`;

    categories.forEach((cat) => {
      xml += `
  <url>
    <loc>https://intimacare.co.ke/category/${cat.slug}</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>`;
    });

    products.forEach((product) => {
      xml += `
  <url>
    <loc>https://intimacare.co.ke/product/${product.slug}</loc>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
  </url>`;
    });

    xml += `
</urlset>`;
    return xml;
  };

  return (
    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {buildSitemap()}
    </pre>
  );
};

export default Sitemap;

import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import SEO from "../../components/common/SEO";
import {
  getCategoryMeta,
  generateCategorySchema,
} from "../../utils/seoHelpers";
import { fetchProducts, clearCategory } from "../../redux/slices/productsSlice";
import { fetchCategories } from "../../redux/slices/categoriesSlice";

const CategoryPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { products, loading, total, page, pages } = useSelector(
    (state) => state.products,
  );
  const { categories } = useSelector((state) => state.categories);

  // Find current category from categories list
  const currentCategory = categories.find((cat) => cat.slug === slug);

  useEffect(() => {
    // Fetch categories if not loaded
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }

    // Fetch products for this category
    if (slug) {
      dispatch(fetchProducts({ category: slug }));
    }

    // Clear category on unmount
    return () => {
      dispatch(clearCategory());
    };
  }, [dispatch, slug, categories.length]);

  const meta = getCategoryMeta(slug);
  const schema = currentCategory
    ? generateCategorySchema(currentCategory, products)
    : null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F7F3EA]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-[#B08D4F] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-[#8C7B6B] tracking-wide">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  // If category not found
  if (!currentCategory && !loading && categories.length > 0) {
    return (
      <>
        <SEO
          title="Category Not Found | Intimacare Kenya"
          description="The category you're looking for could not be found. Browse our collection of premium adult toys in Kenya."
          keywords="category not found, adult toys Kenya"
          url="/category/not-found"
        />
        <div className="min-h-[60vh] flex items-center justify-center bg-[#F7F3EA] font-['Work_Sans']">
          <div className="text-center px-6">
            <h2 className="font-display text-3xl text-[#14120F] mb-3">
              Category Not Found
            </h2>
            <p className="text-[#8C7B6B] mb-6 text-sm">
              The category "{slug}" doesn't exist.
            </p>
            <Link
              to="/shop"
              className="text-xs uppercase tracking-[0.2em] text-[#B08D4F] hover:text-[#14120F] transition-colors"
            >
              ← Back to Shop
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
        url={`/category/${slug}`}
        type="website"
        schema={schema}
      />

      <div className="min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
          .font-display { font-family: 'Fraunces', serif; }
        `}</style>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#8C7B6B] mb-8">
            <Link to="/" className="hover:text-[#14120F] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-[#14120F] transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-[#14120F]">
              {currentCategory?.name || slug}
            </span>
          </div>

          {/* Category Header */}
          <div className="mb-10">
            <h1 className="font-display text-3xl sm:text-4xl text-[#14120F] leading-tight">
              {currentCategory?.name ||
                slug.charAt(0).toUpperCase() + slug.slice(1)}
            </h1>
            {currentCategory?.description && (
              <p className="text-[#5C5348] text-sm mt-3 max-w-2xl leading-relaxed">
                {currentCategory.description}
              </p>
            )}
            <div className="mt-4 text-sm text-[#8C7B6B]">
              {total} {total === 1 ? "product" : "products"}
            </div>
          </div>

          {/* Product Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product.slug || product._id}`}
                  className="group"
                >
                  <div className="bg-[#EFEAE0] overflow-hidden aspect-[3/4]">
                    <img
                      src={
                        product.images?.[0] ||
                        "https://via.placeholder.com/400x500?text=No+Image"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/400x500?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-medium text-[#14120F] group-hover:text-[#B08D4F] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[#B08D4F] text-sm mt-1">
                      KES {product.price.toLocaleString()}
                    </p>
                    {product.isFeatured && (
                      <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-[#B08D4F] border border-[#B08D4F] px-2 py-0.5 mt-2">
                        Featured
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#8C7B6B]">
                No products found in this category.
              </p>
              <Link
                to="/shop"
                className="inline-block mt-4 text-xs uppercase tracking-[0.2em] text-[#B08D4F] hover:text-[#14120F] transition-colors"
              >
                Browse All Products →
              </Link>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() =>
                  dispatch(fetchProducts({ category: slug, page: page - 1 }))
                }
                disabled={page === 1}
                className={`text-xs uppercase tracking-[0.2em] ${
                  page === 1
                    ? "text-[#D8CFBC] cursor-not-allowed"
                    : "text-[#14120F] hover:text-[#B08D4F] transition-colors"
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-[#8C7B6B]">
                Page {page} of {pages}
              </span>
              <button
                onClick={() =>
                  dispatch(fetchProducts({ category: slug, page: page + 1 }))
                }
                disabled={page === pages}
                className={`text-xs uppercase tracking-[0.2em] ${
                  page === pages
                    ? "text-[#D8CFBC] cursor-not-allowed"
                    : "text-[#14120F] hover:text-[#B08D4F] transition-colors"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;

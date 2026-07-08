/**
 * ShopPage — luxury boutique redesign
 * ------------------------------------------------------------------
 * Fonts used: "Fraunces" (display serif) + "Work Sans" (body/UI).
 * For best performance, add these to your public/index.html <head>
 * instead of relying on the inline @import below:
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 * <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
 *
 * The inline <style> tag below is left in as a safe fallback so the
 * page still looks right even if you forget to add the link tags.
 *
 * All data logic (redux, routing, cart, filters, pagination) is
 * untouched — only markup/classNames changed.
 * ------------------------------------------------------------------
 */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import {
  fetchProducts,
  setFilters,
  clearFilters,
} from "../../redux/slices/productsSlice";
import { fetchCategories } from "../../redux/slices/categoriesSlice";
import { addToCart } from "../../redux/slices/cartSlice";
import { getImageUrl } from "../../api";
import { ShoppingBag, Filter, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const ShopPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    category: searchParams.get("category") || "",
    minPrice: "",
    maxPrice: "",
    search: "",
    sort: "",
  });

  const { products, loading, error, total, page, pages, filters } = useSelector(
    (state) => state.products,
  );
  const { categories } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = { ...filters };
    if (searchParams.get("category")) {
      params.category = searchParams.get("category");
    }
    dispatch(fetchProducts(params));
  }, [dispatch, filters, searchParams]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({ ...localFilters, [name]: value });
  };

  const applyFilters = () => {
    const filtered = {};
    if (localFilters.category) filtered.category = localFilters.category;
    if (localFilters.minPrice) filtered.minPrice = localFilters.minPrice;
    if (localFilters.maxPrice) filtered.maxPrice = localFilters.maxPrice;
    if (localFilters.search) filtered.search = localFilters.search;
    if (localFilters.sort) filtered.sort = localFilters.sort;

    dispatch(setFilters(filtered));
    setShowFilters(false);
  };

  const clearAllFilters = () => {
    setLocalFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      search: "",
      sort: "",
    });
    dispatch(clearFilters());
    setShowFilters(false);
  };

  // ✅ Updated function with stock and variant validations
  const handleAddToCart = (product) => {
    // Check base product stock
    if (product.stock === 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    const firstVariant =
      product.variants && product.variants.length > 0
        ? {
            size: product.variants[0].size || "",
            color: product.variants[0].color || "",
            priceAdjustment: product.variants[0].price || 0,
          }
        : null;

    // Check variant stock if it exists
    if (firstVariant && firstVariant.size) {
      const variant = product.variants.find(
        (v) => v.size === firstVariant.size && v.color === firstVariant.color,
      );
      if (variant && variant.stock === 0) {
        toast.error(`${product.name} is out of stock`);
        return;
      }
    }

    dispatch(
      addToCart({
        productId: product._id,
        quantity: 1,
        selectedVariant: firstVariant,
      }),
    );
    toast.success("Added to cart!");
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pages) {
      dispatch(fetchProducts({ ...filters, page: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
      {/* Fallback font import — prefer adding the <link> tags in index.html */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {/* ---------- Header ---------- */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-14 border-b border-[#E6DFD1] pb-8">
          <div>
            <p className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-[#B08D4F] font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Curated Collection
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-medium text-[#14120F] leading-tight">
              Shop
            </h1>
            <p className="text-[#8C7B6B] mt-2 text-sm tracking-wide">
              {total} piece{total === 1 ? "" : "s"} available
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="self-start sm:self-auto flex items-center gap-2 border border-[#14120F] text-[#14120F] px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#14120F] hover:text-[#F7F3EA] transition-colors duration-300"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* ---------- Filter Drawer ---------- */}
        {showFilters && (
          <div className="fixed inset-0 bg-[#14120F]/60 z-50 flex justify-end backdrop-blur-[2px]">
            <div className="bg-[#F7F3EA] w-full max-w-md h-full overflow-y-auto p-8 sm:p-10 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
              <div className="flex justify-between items-center mb-10 border-b border-[#E6DFD1] pb-6">
                <h2 className="font-display text-2xl text-[#14120F]">Refine</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-[#8C7B6B] hover:text-[#14120F] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-8">
                <label className="block text-[11px] uppercase tracking-[0.2em] text-[#8C7B6B] mb-3">
                  Category
                </label>
                <select
                  name="category"
                  value={localFilters.category}
                  onChange={handleFilterChange}
                  className="w-full bg-transparent border-b border-[#D8CFBC] py-2.5 text-[#14120F] text-sm focus:outline-none focus:border-[#B08D4F] transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-8">
                <label className="block text-[11px] uppercase tracking-[0.2em] text-[#8C7B6B] mb-3">
                  Price Range
                </label>
                <div className="flex gap-6">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={localFilters.minPrice}
                    onChange={handleFilterChange}
                    className="w-1/2 bg-transparent border-b border-[#D8CFBC] py-2.5 text-sm text-[#14120F] placeholder:text-[#B7AC98] focus:outline-none focus:border-[#B08D4F] transition-colors"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={localFilters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-1/2 bg-transparent border-b border-[#D8CFBC] py-2.5 text-sm text-[#14120F] placeholder:text-[#B7AC98] focus:outline-none focus:border-[#B08D4F] transition-colors"
                  />
                </div>
              </div>

              <div className="mb-10">
                <label className="block text-[11px] uppercase tracking-[0.2em] text-[#8C7B6B] mb-3">
                  Sort By
                </label>
                <select
                  name="sort"
                  value={localFilters.sort}
                  onChange={handleFilterChange}
                  className="w-full bg-transparent border-b border-[#D8CFBC] py-2.5 text-sm text-[#14120F] focus:outline-none focus:border-[#B08D4F] transition-colors"
                >
                  <option value="">Default</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-[#1F3D33] text-[#F7F3EA] py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#14120F] transition-colors duration-300"
                >
                  Apply
                </button>
                <button
                  onClick={clearAllFilters}
                  className="flex-1 border border-[#D8CFBC] text-[#14120F] py-3 text-xs uppercase tracking-[0.2em] hover:border-[#14120F] transition-colors duration-300"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Loading ---------- */}
        {loading && (
          <div className="text-center py-24">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-[#B08D4F] border-t-transparent"></div>
            <p className="mt-5 text-[#8C7B6B] text-sm tracking-wide">
              Loading pieces…
            </p>
          </div>
        )}

        {/* ---------- Error ---------- */}
        {error && (
          <div className="text-center py-24">
            <p className="text-[#8C4B3A] text-sm tracking-wide">{error}</p>
            <button
              onClick={() => dispatch(fetchProducts(filters))}
              className="mt-6 border border-[#14120F] text-[#14120F] px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#14120F] hover:text-[#F7F3EA] transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ---------- Grid ---------- */}
        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-24">
                <ShoppingBag
                  className="w-12 h-12 text-[#D8CFBC] mx-auto mb-5"
                  strokeWidth={1.25}
                />
                <h3 className="font-display text-2xl text-[#14120F] mb-2">
                  Nothing here yet
                </h3>
                <p className="text-[#8C7B6B] text-sm">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                {products.map((product) => (
                  <div key={product._id} className="group">
                    <Link to={`/product/${product.slug}`}>
                      <div className="relative aspect-[4/5] bg-[#EFEAE0] overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]} // Direct Cloudinary URL
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/400x500?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-[#B7AC98] text-sm tracking-wide">
                            No Image
                          </div>
                        )}
                        {product.isFeatured && (
                          <span className="absolute top-3 left-3 border border-[#B08D4F] text-[#B08D4F] bg-[#F7F3EA]/90 text-[10px] uppercase tracking-[0.2em] px-3 py-1.5">
                            Featured
                          </span>
                        )}

                        {/* Quick add — reveals on hover, desktop only */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          className="hidden sm:flex absolute bottom-0 left-0 right-0 items-center justify-center gap-2 bg-[#14120F] text-[#F7F3EA] py-3 text-xs uppercase tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Add to Bag
                        </button>
                      </div>
                    </Link>

                    <div className="pt-4">
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="font-display text-lg text-[#14120F] leading-snug line-clamp-2 group-hover:text-[#1F3D33] transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[#B08D4F] font-medium tracking-wide">
                          {formatCurrency(product.price)}
                        </span>

                        {/* Mobile add-to-cart (no hover state on touch) */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="sm:hidden text-[#14120F] border border-[#D8CFBC] p-2 hover:border-[#14120F] transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>

                      {product.variants && product.variants.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {[
                            ...new Set(
                              product.variants
                                .map((v) => v.color)
                                .filter(Boolean),
                            ),
                          ]
                            .slice(0, 3)
                            .map((color, idx) => (
                              <span
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-[#D8CFBC]"
                                style={{ backgroundColor: color.toLowerCase() }}
                                title={color}
                              />
                            ))}
                          {product.variants.length > 3 && (
                            <span className="text-[11px] text-[#8C7B6B] tracking-wide">
                              +{product.variants.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ---------- Pagination ---------- */}
            {pages > 1 && (
              <div className="flex justify-center items-center gap-8 mt-16 pt-8 border-t border-[#E6DFD1]">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="text-xs uppercase tracking-[0.2em] text-[#14120F] disabled:text-[#D8CFBC] disabled:cursor-not-allowed hover:text-[#B08D4F] transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-[#8C7B6B] tracking-wide font-display">
                  {page} / {pages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pages}
                  className="text-xs uppercase tracking-[0.2em] text-[#14120F] disabled:text-[#D8CFBC] disabled:cursor-not-allowed hover:text-[#B08D4F] transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;

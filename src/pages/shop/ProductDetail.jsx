/**
 * ProductDetail — luxury boutique redesign (matches ShopPage)
 * ------------------------------------------------------------------
 * Fonts: "Fraunces" (display serif) + "Work Sans" (body/UI).
 * Add these to public/index.html for best performance:
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 * <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
 *
 * All data logic (redux, variant selection, quantity, cart, routing)
 * is untouched — only markup/classNames changed.
 * ------------------------------------------------------------------
 */
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduct } from "../../redux/slices/productsSlice";
import { addToCart } from "../../redux/slices/cartSlice";
import { getImageUrl } from "../../api";
import {
  ShoppingBag,
  ArrowLeft,
  Truck,
  Shield,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector((state) => state.products);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    dispatch(fetchProduct(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAvailableColors = () => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.color).filter(Boolean))];
  };

  const getAvailableSizes = () => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
  };

  const getVariantByColorSize = (color, size) => {
    return product?.variants?.find((v) => v.color === color && v.size === size);
  };

  const handleVariantSelect = (color, size) => {
    const variant = getVariantByColorSize(color, size);
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const getCurrentPrice = () => {
    if (selectedVariant?.price) {
      return selectedVariant.price;
    }
    return product?.price || 0;
  };

  const getCurrentStock = () => {
    if (selectedVariant) {
      return selectedVariant.stock || 0;
    }
    return product?.stock || 0;
  };

  const handleAddToCart = () => {
    const availableStock = getCurrentStock();

    // ✅ Check stock before adding
    if (availableStock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (availableStock < quantity) {
      toast.error(`Only ${availableStock} available in stock`);
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      price: getCurrentPrice(),
      quantity: quantity,
      image: product.images?.[0] || null,
      selectedVariant: selectedVariant
        ? {
            color: selectedVariant.color,
            size: selectedVariant.size,
          }
        : null,
    };

    dispatch(addToCart(cartItem));
    toast.success("Added to cart!");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F7F3EA]">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-[#B08D4F] border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F7F3EA] font-['Work_Sans']">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap'); .font-display { font-family: 'Fraunces', serif; }`}</style>
        <div className="text-center px-6">
          <h2 className="font-display text-3xl text-[#14120F] mb-3">
            Product Not Found
          </h2>
          <p className="text-[#8C7B6B] mb-6 text-sm">
            The piece you're looking for doesn't exist.
          </p>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-[0.2em] text-[#B08D4F] hover:text-[#14120F] transition-colors"
          >
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const colors = getAvailableColors();
  const sizes = getAvailableSizes();
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <div className="min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8C7B6B] hover:text-[#14120F] transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-[#EFEAE0] overflow-hidden aspect-[4/5]">
              <img
                src={
                  getImageUrl(product.images?.[selectedImage]) ||
                  "https://via.placeholder.com/600x750?text=No+Image"
                }
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/600x750?text=No+Image";
                }}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-20 overflow-hidden flex-shrink-0 border transition-colors ${
                      selectedImage === index
                        ? "border-[#14120F]"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/80x100?text=No+Image";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-7">
            {product.isFeatured && (
              <span className="inline-block border border-[#B08D4F] text-[#B08D4F] text-[10px] uppercase tracking-[0.2em] px-3 py-1.5">
                Featured
              </span>
            )}

            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-[#14120F] leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-4">
                <p className="text-2xl text-[#B08D4F] font-medium tracking-wide">
                  {formatCurrency(getCurrentPrice())}
                </p>
                {selectedVariant?.price > 0 &&
                  selectedVariant.price !== product.price && (
                    <span className="text-sm text-[#B7AC98] line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {getCurrentStock() > 0 ? (
                <span className="text-[#1F3D33] text-xs uppercase tracking-[0.15em] font-medium">
                  In Stock — {getCurrentStock()} available
                </span>
              ) : (
                <span className="text-[#8C4B3A] text-xs uppercase tracking-[0.15em] font-medium">
                  Out of Stock
                </span>
              )}
            </div>

            <p className="text-[#5C5348] leading-relaxed text-sm border-t border-[#E6DFD1] pt-6">
              {product.description}
            </p>

            {/* Variants */}
            {hasVariants && (
              <div className="space-y-6">
                {colors.length > 0 && (
                  <div>
                    <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#8C7B6B] mb-3">
                      Color
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => {
                        const hasStock = product.variants.some(
                          (v) => v.color === color && v.stock > 0,
                        );
                        const isSelected = selectedVariant?.color === color;
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              const size =
                                selectedVariant?.size || sizes[0] || "";
                              handleVariantSelect(color, size);
                            }}
                            disabled={!hasStock}
                            className={`px-4 py-2.5 border transition-all ${
                              isSelected
                                ? "border-[#14120F] bg-[#14120F] text-[#F7F3EA]"
                                : "border-[#D8CFBC] hover:border-[#14120F] text-[#14120F]"
                            } ${!hasStock ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-[#D8CFBC]"
                                style={{ backgroundColor: color.toLowerCase() }}
                              />
                              <span className="text-xs tracking-wide">
                                {color}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div>
                    <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#8C7B6B] mb-3">
                      Size
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => {
                        const hasStock = product.variants.some(
                          (v) => v.size === size && v.stock > 0,
                        );
                        const isSelected = selectedVariant?.size === size;
                        return (
                          <button
                            key={size}
                            onClick={() => {
                              const color =
                                selectedVariant?.color || colors[0] || "";
                              handleVariantSelect(color, size);
                            }}
                            disabled={!hasStock}
                            className={`px-4 py-2.5 border transition-all ${
                              isSelected
                                ? "border-[#14120F] bg-[#14120F] text-[#F7F3EA]"
                                : "border-[#D8CFBC] hover:border-[#14120F] text-[#14120F]"
                            } ${!hasStock ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            <span className="text-xs tracking-wide font-medium">
                              {size}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#8C7B6B] mb-3">
                Quantity
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#D8CFBC]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-[#EFEAE0] transition-colors text-[#14120F]"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-medium text-[#14120F]">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(getCurrentStock(), quantity + 1))
                    }
                    className="w-10 h-10 flex items-center justify-center hover:bg-[#EFEAE0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[#14120F]"
                    disabled={quantity >= getCurrentStock()}
                  >
                    +
                  </button>
                </div>
                {getCurrentStock() > 0 && (
                  <span className="text-xs text-[#8C7B6B] tracking-wide">
                    Max {getCurrentStock()}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={getCurrentStock() === 0}
              className="w-full bg-[#14120F] text-[#F7F3EA] py-4 text-xs uppercase tracking-[0.25em] hover:bg-[#1F3D33] transition-colors duration-300 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              {getCurrentStock() === 0 ? "Out of Stock" : "Add to Bag"}
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E6DFD1]">
              <div className="text-center">
                <Truck
                  className="w-5 h-5 text-[#B08D4F] mx-auto mb-2"
                  strokeWidth={1.5}
                />
                <p className="text-[11px] text-[#8C7B6B] leading-snug tracking-wide">
                  Free shipping over KES 5,000
                </p>
              </div>
              <div className="text-center">
                <Shield
                  className="w-5 h-5 text-[#B08D4F] mx-auto mb-2"
                  strokeWidth={1.5}
                />
                <p className="text-[11px] text-[#8C7B6B] leading-snug tracking-wide">
                  Discreet packaging
                </p>
              </div>
              <div className="text-center">
                <CreditCard
                  className="w-5 h-5 text-[#B08D4F] mx-auto mb-2"
                  strokeWidth={1.5}
                />
                <p className="text-[11px] text-[#8C7B6B] leading-snug tracking-wide">
                  Secure payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

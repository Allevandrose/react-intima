import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { getOptimizedImage } from "../../utils/imageHelpers";
import { ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  // ✅ Use Cloudinary optimized image
  const imageUrl = product?.images?.[0]
    ? getOptimizedImage(product.images[0], "small")
    : "/placeholder-image.png";

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) {
      toast.error("Out of stock");
      return;
    }

    dispatch(
      addToCart({
        productId: product._id,
        quantity: 1,
        selectedVariant: null,
      }),
    );
    toast.success("Added to cart!");
  };

  return (
    <div className="group">
      <Link to={`/product/${product.slug}`}>
        <div className="relative aspect-[4/5] bg-[#EFEAE0] overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-image.png";
            }}
          />
          {product.isFeatured && (
            <span className="absolute top-3 left-3 border border-[#B08D4F] text-[#B08D4F] bg-[#F7F3EA]/90 text-[10px] uppercase tracking-[0.2em] px-3 py-1.5">
              Featured
            </span>
          )}

          {/* Quick add button */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 bg-[#14120F] text-[#F7F3EA] py-3 text-xs uppercase tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
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
        </div>

        {product.variants && product.variants.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {[...new Set(product.variants.map((v) => v.color).filter(Boolean))]
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
  );
};

export default ProductCard;

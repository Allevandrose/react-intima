import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../../api";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = () => {
    // Get first variant if available
    const firstVariant =
      product.variants && product.variants.length > 0
        ? {
            size: product.variants[0].size || "",
            color: product.variants[0].color || "",
            priceAdjustment: product.variants[0].price || 0,
          }
        : null;

    dispatch(
      addToCart({
        productId: product._id,
        quantity: 1,
        selectedVariant: firstVariant,
      }),
    );
    toast.success("Added to cart!");
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <Link to={`/product/${product.slug}`}>
        <div className="relative h-64 bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={getImageUrl(product.images[0])}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/400x400?text=No+Image";
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
          {product.isFeatured && (
            <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xl font-bold text-primary-600">
            {formatCurrency(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>

        {product.variants && product.variants.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {[...new Set(product.variants.map((v) => v.color))]
              .slice(0, 3)
              .map((color, idx) => (
                <span
                  key={idx}
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
            {product.variants.length > 3 && (
              <span className="text-xs text-gray-500">
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

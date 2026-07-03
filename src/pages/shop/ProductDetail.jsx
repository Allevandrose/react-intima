import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../../redux/slices/productsSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { ShoppingBag, ArrowLeft, Truck, Shield, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

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
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAvailableColors = () => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map(v => v.color).filter(Boolean))];
  };

  const getAvailableSizes = () => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map(v => v.size).filter(Boolean))];
  };

  const getVariantByColorSize = (color, size) => {
    return product?.variants?.find(v => v.color === color && v.size === size);
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
    if (getCurrentStock() < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      price: getCurrentPrice(),
      quantity: quantity,
      selectedVariant: selectedVariant ? {
        color: selectedVariant.color,
        size: selectedVariant.size
      } : null
    };

    dispatch(addToCart(cartItem));
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium">
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
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square">
            <img
              src={product.images?.[selectedImage] || 'https://via.placeholder.com/600x600?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImage === index ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {product.isFeatured && (
            <span className="inline-block bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Featured
            </span>
          )}

          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(getCurrentPrice())}</p>
            {selectedVariant?.price > 0 && selectedVariant.price !== product.price && (
              <span className="text-sm text-gray-500 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {getCurrentStock() > 0 ? (
              <span className="text-green-600 text-sm font-medium">✓ In Stock ({getCurrentStock()} available)</span>
            ) : (
              <span className="text-red-600 text-sm font-medium">✗ Out of Stock</span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Variants */}
          {hasVariants && (
            <div className="space-y-4">
              {colors.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => {
                      const hasStock = product.variants.some(v => v.color === color && v.stock > 0);
                      const isSelected = selectedVariant?.color === color;
                      return (
                        <button
                          key={color}
                          onClick={() => {
                            const size = selectedVariant?.size || sizes[0] || '';
                            handleVariantSelect(color, size);
                          }}
                          disabled={!hasStock}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            isSelected ? 'border-primary-600 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                          } ${!hasStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.toLowerCase() }}
                            />
                            <span className="text-sm">{color}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const hasStock = product.variants.some(v => v.size === size && v.stock > 0);
                      const isSelected = selectedVariant?.size === size;
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            const color = selectedVariant?.color || colors[0] || '';
                            handleVariantSelect(color, size);
                          }}
                          disabled={!hasStock}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            isSelected ? 'border-primary-600 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                          } ${!hasStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className="text-sm font-medium">{size}</span>
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
            <h3 className="font-medium text-gray-700 mb-2">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center font-medium text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(getCurrentStock(), quantity + 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                disabled={quantity >= getCurrentStock()}
              >
                +
              </button>
              {getCurrentStock() > 0 && (
                <span className="text-sm text-gray-500">Max: {getCurrentStock()}</span>
              )}
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={getCurrentStock() === 0}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-5 h-5" />
            {getCurrentStock() === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <Truck className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Free shipping over KES 5,000</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Discreet packaging</p>
            </div>
            <div className="text-center">
              <CreditCard className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Secure payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

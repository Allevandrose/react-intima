import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  Shield,
  Truck,
  CreditCard
} from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalItems, subtotal, shipping, total } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) {
      dispatch(removeFromCart({
        productId: item.productId,
        selectedVariant: item.selectedVariant
      }));
      toast.success('Item removed from cart');
    } else {
      dispatch(updateQuantity({
        productId: item.productId,
        selectedVariant: item.selectedVariant,
        quantity: newQuantity
      }));
    }
  };

  const handleRemoveItem = (item) => {
    dispatch(removeFromCart({
      productId: item.productId,
      selectedVariant: item.selectedVariant
    }));
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
      toast.success('Cart cleared');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link 
            to="/shop" 
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
        <button
          onClick={handleClearCart}
          className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 px-6 py-3 text-sm font-medium text-gray-600 border-b">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div key={index} className="px-4 md:px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Product Info */}
                    <div className="md:col-span-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
                          {item.selectedVariant && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {item.selectedVariant.color && (
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                  {item.selectedVariant.color}
                                </span>
                              )}
                              {item.selectedVariant.size && (
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                  Size {item.selectedVariant.size}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 text-left md:text-center">
                      <span className="text-gray-700 font-medium">{formatCurrency(item.price)}</span>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 flex items-center justify-start md:justify-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end">
                      <span className="font-bold text-primary-600 md:hidden">
                        Total: {formatCurrency(item.price * item.quantity)}
                      </span>
                      <span className="font-bold text-primary-600 hidden md:inline">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="ml-4 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Shopping */}
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 mt-6 text-primary-600 hover:text-primary-700 transition-colors font-medium"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
              </div>
              {shipping > 0 && (
                <div className="text-xs text-gray-500">
                  Free shipping on orders over {formatCurrency(5000)}
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Trust Badges */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="w-4 h-4 text-green-500" />
                <span>Discreet packaging</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCard className="w-4 h-4 text-green-500" />
                <span>Pay via M-Pesa or Card</span>
              </div>
            </div>

            {/* Free Shipping Note */}
            {subtotal > 0 && subtotal < 5000 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                Add {formatCurrency(5000 - subtotal)} more to get free shipping!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

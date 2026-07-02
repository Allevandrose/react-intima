import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Truck, 
  CreditCard, 
  Heart, 
  ArrowRight,
  Sparkles,
  Lock,
  Package,
  Headphones
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: "100% Discreet",
      description: "Plain packaging with no identifiable markings"
    },
    {
      icon: <Truck className="w-8 h-8 text-primary-600" />,
      title: "Fast Delivery",
      description: "Free delivery on orders over KES 5,000"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-primary-600" />,
      title: "Secure Payments",
      description: "Pay via M-Pesa or Card securely"
    },
    {
      icon: <Heart className="w-8 h-8 text-primary-600" />,
      title: "Quality Guaranteed",
      description: "Premium products from trusted brands"
    }
  ];

  const categories = [
    { name: "Vibrators", image: "https://images.unsplash.com/photo-1583947581924-860b5e6f92e6?w=400&h=300&fit=crop" },
    { name: "Lingerie", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=300&fit=crop" },
    { name: "Lubricants", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop" },
    { name: "Dildos", image: "https://images.unsplash.com/photo-1583947581924-860b5e6f92e6?w=400&h=300&fit=crop" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoNHY0aC00em0wIDB2LTRoLTR2NGg0eiIvPjwvZz48L2c+PC9zdmc+')]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary-300" />
              <span className="text-primary-300 font-medium">Premium Wellness Products</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to <span className="text-primary-300">IntimaCare</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
              Your trusted destination for premium wellness products. 
              Discreet packaging, secure payments, and fast delivery across Kenya.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/shop" 
                className="bg-white text-primary-700 px-8 py-3 rounded-full font-semibold hover:bg-primary-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/register" 
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all duration-200 flex items-center justify-center"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Why Choose IntimaCare</h2>
            <p className="text-gray-600">We prioritize your privacy and satisfaction</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Shop by Category</h2>
            <p className="text-gray-600">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link 
                key={index}
                to={`/shop?category=${category.name.toLowerCase()}`}
                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center">
                  <Lock className="w-7 h-7 text-primary-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Privacy First</h3>
              <p className="text-gray-600 text-sm">Your identity and purchases are always protected</p>
            </div>
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center">
                  <Package className="w-7 h-7 text-primary-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Discreet Packaging</h3>
              <p className="text-gray-600 text-sm">Plain boxes with no branding or product details</p>
            </div>
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center">
                  <Headphones className="w-7 h-7 text-primary-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">We're here to help whenever you need us</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-primary-200 mb-8 max-w-xl mx-auto">
            Join thousands of satisfied customers. Create your account today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/shop" 
              className="bg-white text-primary-700 px-8 py-3 rounded-full font-semibold hover:bg-primary-50 transition-colors"
            >
              Start Shopping
            </Link>
            <Link 
              to="/register" 
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

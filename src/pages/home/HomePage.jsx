/**
 * HomePage — luxury boutique redesign (matches Header / ShopPage /
 * ProductDetail / CartPage)
 * ------------------------------------------------------------------
 * Fonts: "Fraunces" (display serif) + "Work Sans" (body/UI).
 * Add to public/index.html for best performance:
 *
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 *   <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
 *
 * All routing (Link targets, category query params) is untouched —
 * only markup/classNames/copy-polish changed.
 * Images updated using premium, mood-aligned Lorem Picsum assets.
 * ------------------------------------------------------------------
 */
import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Truck,
  CreditCard,
  Heart,
  ArrowRight,
  Sparkles,
  Lock,
  Package,
  Headphones,
} from "lucide-react";

const HomePage = () => {
  const features = [
    {
      icon: <Shield className="w-6 h-6" strokeWidth={1.5} />,
      title: "100% Discreet",
      description: "Plain packaging with no identifiable markings",
    },
    {
      icon: <Truck className="w-6 h-6" strokeWidth={1.5} />,
      title: "Fast Delivery",
      description: "Free delivery on orders over KES 5,000",
    },
    {
      icon: <CreditCard className="w-6 h-6" strokeWidth={1.5} />,
      title: "Secure Payments",
      description: "Pay via M-Pesa or Card securely",
    },
    {
      icon: <Heart className="w-6 h-6" strokeWidth={1.5} />,
      title: "Quality Guaranteed",
      description: "Premium products from trusted brands",
    },
  ];

  const categories = [
    {
      name: "Vibrators",
      // Curated minimalist architectural object silhouette
      image: "https://picsum.photos/id/1062/400/500",
    },
    {
      name: "Lingerie",
      // Soft luxury fabric / silk setting texture
      image: "https://picsum.photos/id/1026/400/500",
    },
    {
      name: "Lubricants",
      // Clean wellness aesthetic glass/dropper theme
      image: "https://picsum.photos/id/646/400/500",
    },
    {
      name: "Dildos",
      // Sculptural art object form
      image: "https://picsum.photos/id/445/400/500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      {/* Hero Section */}
      <section className="relative bg-[#14120F] text-[#F7F3EA] py-24 sm:py-32 overflow-hidden">
        {/* subtle brass hairline grid, not a stock gradient */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#B08D4F 1px, transparent 1px), linear-gradient(90deg, #B08D4F 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        ></div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-[#B08D4F] font-medium mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Premium Wellness, Discreetly Delivered
            </p>
            <h1 className="font-display text-5xl sm:text-6xl font-medium leading-[1.1] mb-6">
              Welcome to{" "}
              <span className="italic text-[#B08D4F]">IntimaCare</span>
            </h1>
            <p className="text-[#D8CFBC] text-lg leading-relaxed mb-10 max-w-xl">
              Your trusted destination for premium wellness products — discreet
              packaging, secure payments, and fast delivery across Kenya.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop"
                className="bg-[#F7F3EA] text-[#14120F] px-8 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[#B08D4F] hover:text-[#14120F] transition-colors duration-300 flex items-center justify-center gap-2"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="border border-[#D8CFBC]/40 text-[#F7F3EA] px-8 py-3.5 text-xs uppercase tracking-[0.2em] hover:border-[#F7F3EA] transition-colors duration-300 flex items-center justify-center"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#B08D4F] mb-3">
              The Difference
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-[#14120F]">
              Why Choose IntimaCare
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4 text-[#B08D4F]">
                  {feature.icon}
                </div>
                <h3 className="font-display text-lg text-[#14120F] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#8C7B6B] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 sm:py-24 bg-[#EFEAE0]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#B08D4F] mb-3">
              Explore
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-[#14120F]">
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/shop?category=${category.name.toLowerCase()}`}
                className="group relative overflow-hidden aspect-[4/5] bg-[#E6DFD1]"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/400x500?text=" +
                      category.name;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14120F]/80 via-[#14120F]/10 to-transparent flex items-end p-5">
                  <h3 className="font-display text-lg sm:text-xl text-[#F7F3EA]">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 border border-[#D8CFBC] rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#B08D4F]" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="font-display text-lg text-[#14120F] mb-2">
                Privacy First
              </h3>
              <p className="text-[#8C7B6B] text-sm leading-relaxed">
                Your identity and purchases are always protected
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 border border-[#D8CFBC] rounded-full flex items-center justify-center">
                  <Package
                    className="w-6 h-6 text-[#B08D4F]"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h3 className="font-display text-lg text-[#14120F] mb-2">
                Discreet Packaging
              </h3>
              <p className="text-[#8C7B6B] text-sm leading-relaxed">
                Plain boxes with no branding or product details
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 border border-[#D8CFBC] rounded-full flex items-center justify-center">
                  <Headphones
                    className="w-6 h-6 text-[#B08D4F]"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h3 className="font-display text-lg text-[#14120F] mb-2">
                24/7 Support
              </h3>
              <p className="text-[#8C7B6B] text-sm leading-relaxed">
                We're here to help whenever you need us
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-[#14120F] text-[#F7F3EA]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl mb-4">
            Ready to Shop?
          </h2>
          <p className="text-[#D8CFBC] mb-10 leading-relaxed">
            Join thousands of satisfied customers. Create your account today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/shop"
              className="bg-[#F7F3EA] text-[#14120F] px-8 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[#B08D4F] transition-colors duration-300"
            >
              Start Shopping
            </Link>
            <Link
              to="/register"
              className="border border-[#D8CFBC]/40 text-[#F7F3EA] px-8 py-3.5 text-xs uppercase tracking-[0.2em] hover:border-[#F7F3EA] transition-colors duration-300"
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

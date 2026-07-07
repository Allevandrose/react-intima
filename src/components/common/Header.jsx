/**
 * Header — luxury boutique redesign (matches ShopPage / ProductDetail)
 * ------------------------------------------------------------------
 * Fonts: "Fraunces" (display serif, used for the wordmark) + "Work Sans"
 * (nav/body). Add to public/index.html for best performance:
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 * <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
 *
 * All auth/cart logic (redux selectors, logout dispatch, navigation)
 * is untouched — only markup/classNames changed. The heart mark was
 * kept but recolored/restyled rather than removed, since it's your
 * existing brand mark — swap the icon out if you'd like something else.
 * ------------------------------------------------------------------
 */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice";
import { ShoppingCart, LogOut, Heart } from "lucide-react";
import toast from "react-hot-toast";

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/");
  };

  // 🆕 Check if user is admin
  const isAdmin = user?.role === "admin";

  return (
    <header className="bg-[#F7F3EA]/95 backdrop-blur-sm sticky top-0 z-50 border-b border-[#E6DFD1] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <Heart
              className="w-5 h-5 text-[#B08D4F] transition-transform duration-300 group-hover:scale-110"
              strokeWidth={1.5}
            />
            <span className="font-display text-xl tracking-wide text-[#14120F]">
              IntimaCare
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-7 sm:gap-9">
            {/* 🆕 Only show Shop when authenticated AND not admin */}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/shop"
                className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-[#5C5348] hover:text-[#14120F] transition-colors"
              >
                Shop
              </Link>
            )}

            {/* 🆕 Show Orders link only if authenticated and NOT admin */}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/orders"
                className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-[#5C5348] hover:text-[#14120F] transition-colors"
              >
                Orders
              </Link>
            )}

            {/* 🆕 Show Dashboard link if authenticated and IS admin */}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-[#5C5348] hover:text-[#14120F] transition-colors"
              >
                Dashboard
              </Link>
            )}

            {/* 🆕 Cart - Only show for authenticated non-admin users */}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/cart"
                className="relative text-[#14120F] hover:text-[#B08D4F] transition-colors"
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#B08D4F] text-[#F7F3EA] text-[10px] font-medium rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#8C7B6B] tracking-wide hidden md:inline">
                  {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-[#5C5348] hover:text-[#14120F] transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="w-4.5 h-4.5" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              // 🆕 Guest mode - Only show Login and Register
              <div className="flex items-center gap-5">
                <Link
                  to="/login"
                  className="text-xs uppercase tracking-[0.2em] text-[#5C5348] hover:text-[#14120F] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="border border-[#14120F] text-[#14120F] px-5 py-2.5 text-xs uppercase tracking-[0.2em] hover:bg-[#14120F] hover:text-[#F7F3EA] transition-colors duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

/**
 * Header — luxury boutique redesign (matches ShopPage / ProductDetail)
 * ------------------------------------------------------------------
 * Fonts: "Fraunces" (display serif, used for the wordmark) + "Work Sans"
 * (nav/body). Add to public/index.html for best performance:
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 * <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
 * ------------------------------------------------------------------
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice";
import { ShoppingCart, LogOut, Heart, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    // Prevent multiple logout attempts
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setMenuOpen(false);

    try {
      // ✅ FIX: Don't use .unwrap() - just await the dispatch
      await dispatch(logoutUser());
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch (error) {
      // Even if API fails, we should still clear local state
      console.error("Logout error:", error);
      toast.error("Logout failed, but you've been signed out locally");
      navigate("/", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const isAdmin = user?.role === "admin";

  return (
    <header className="bg-[#FAF8F6]/95 backdrop-blur-sm sticky top-0 z-50 border-b border-[#EAC7C7] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            onClick={closeMenu}
          >
            <Heart
              className="w-5 h-5 text-[#D97466] transition-transform duration-300 group-hover:scale-110"
              strokeWidth={1.5}
            />
            <span className="font-display text-xl tracking-wide text-[#3B1E25]">
              IntimaCare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-7 sm:gap-9">
            {/* Only show Shop when authenticated AND not admin */}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/shop"
                className="text-xs uppercase tracking-[0.2em] text-[#262626]/70 hover:text-[#3B1E25] transition-colors"
              >
                Shop
              </Link>
            )}

            {/* Show Orders link only if authenticated and NOT admin */}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/orders"
                className="text-xs uppercase tracking-[0.2em] text-[#262626]/70 hover:text-[#3B1E25] transition-colors"
              >
                Orders
              </Link>
            )}

            {/* Show Dashboard link if authenticated and IS admin */}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className="text-xs uppercase tracking-[0.2em] text-[#262626]/70 hover:text-[#3B1E25] transition-colors"
              >
                Dashboard
              </Link>
            )}

            {/* Cart - Only show for authenticated non-admin users */}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/cart"
                className="relative text-[#3B1E25] hover:text-[#D97466] transition-colors"
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#D97466] text-[#FAF8F6] text-[10px] font-medium rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#262626]/60 tracking-wide hidden md:inline">
                  {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center text-[#262626]/70 hover:text-[#3B1E25] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Log out"
                >
                  {isLoggingOut ? (
                    <div className="w-4.5 h-4.5 border-2 border-[#3B1E25] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut className="w-4.5 h-4.5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            ) : (
              // Guest mode - Only show Login and Register
              <div className="flex items-center gap-5">
                <Link
                  to="/login"
                  className="text-xs uppercase tracking-[0.2em] text-[#262626]/70 hover:text-[#3B1E25] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="border border-[#3B1E25] text-[#3B1E25] px-5 py-2.5 text-xs uppercase tracking-[0.2em] hover:bg-[#3B1E25] hover:text-[#FAF8F6] transition-colors duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile: cart + hamburger */}
          <div className="flex sm:hidden items-center gap-5">
            {isAuthenticated && !isAdmin && (
              <Link
                to="/cart"
                className="relative text-[#3B1E25] hover:text-[#D97466] transition-colors"
                onClick={closeMenu}
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#D97466] text-[#FAF8F6] text-[10px] font-medium rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="text-[#3B1E25] hover:text-[#D97466] transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="w-6 h-6" strokeWidth={1.5} />
              ) : (
                <Menu className="w-6 h-6" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`sm:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out border-t border-[#EAC7C7] bg-[#FAF8F6] ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-5 py-5 flex flex-col gap-1">
          {isAuthenticated && !isAdmin && (
            <Link
              to="/shop"
              onClick={closeMenu}
              className="py-3 text-xs uppercase tracking-[0.2em] text-[#262626]/70 hover:text-[#3B1E25] border-b border-[#EAC7C7]/60 transition-colors"
            >
              Shop
            </Link>
          )}

          {isAuthenticated && !isAdmin && (
            <Link
              to="/orders"
              onClick={closeMenu}
              className="py-3 text-xs uppercase tracking-[0.2em] text-[#262626]/70 hover:text-[#3B1E25] border-b border-[#EAC7C7]/60 transition-colors"
            >
              Orders
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              onClick={closeMenu}
              className="py-3 text-xs uppercase tracking-[0.2em] text-[#262626]/70 hover:text-[#3B1E25] border-b border-[#EAC7C7]/60 transition-colors"
            >
              Dashboard
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <span className="py-3 text-xs text-[#262626]/60 tracking-wide border-b border-[#EAC7C7]/60">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 py-3 text-xs uppercase tracking-[0.2em] text-[#262626]/70 hover:text-[#3B1E25] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#3B1E25] border-t-transparent rounded-full animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                    Log out
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
                className="py-3 text-xs uppercase tracking-[0.2em] text-[#262626]/70 hover:text-[#3B1E25] border-b border-[#EAC7C7]/60 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="mt-3 text-center border border-[#3B1E25] text-[#3B1E25] px-5 py-2.5 text-xs uppercase tracking-[0.2em] hover:bg-[#3B1E25] hover:text-[#FAF8F6] transition-colors duration-300"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

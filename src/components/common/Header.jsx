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
 *
 * Category dropdown fix notes:
 * - Switched from hover (onMouseEnter/onMouseLeave) to click-to-toggle.
 *   Hover dropdowns break when there's any gap between the trigger and
 *   the panel (here it was `mt-2`), because the mouse leaves the
 *   trigger before entering the panel and the whole thing snaps shut.
 *   Click-to-toggle is also more reliable on touch devices.
 * - Added an outside-click + Escape-key listener via a ref, so the
 *   panel actually closes when you'd expect it to.
 * - Desktop and mobile now use separate open/close state so toggling
 *   one never leaves the other stuck open.
 * - Panel is capped with max-height + overflow-y-auto so it doesn't
 *   grow off-screen once there are many categories.
 * - Dropdown closes automatically on route change.
 */
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice";
import { fetchCategories } from "../../redux/slices/categoriesSlice";
import {
  ShoppingCart,
  LogOut,
  Heart,
  Menu,
  X,
  ChevronDown,
  Grid,
} from "lucide-react";
import toast from "react-hot-toast";

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.categories,
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Separate state for desktop vs mobile so they never fight each other
  const [desktopCategoriesOpen, setDesktopCategoriesOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  const desktopDropdownRef = useRef(null);

  // ✅ Fetch categories only when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCategories());
    }
  }, [dispatch, isAuthenticated]);

  // ✅ Close desktop dropdown on outside click or Escape
  useEffect(() => {
    if (!desktopCategoriesOpen) return;

    const handleClickOutside = (e) => {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(e.target)
      ) {
        setDesktopCategoriesOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setDesktopCategoriesOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [desktopCategoriesOpen]);

  // ✅ Close all menus whenever the route changes
  useEffect(() => {
    setDesktopCategoriesOpen(false);
    setMobileCategoriesOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setMenuOpen(false);

    try {
      await dispatch(logoutUser());
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);
  const isAdmin = user?.role === "admin";
  const showShopperNav = isAuthenticated && !isAdmin;

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
            {/* ✅ Categories Dropdown - click to toggle, closes on outside click / Escape / route change */}
            {showShopperNav && (
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  type="button"
                  onClick={() => setDesktopCategoriesOpen((open) => !open)}
                  className="text-xs uppercase tracking-[0.2em] text-[#262626]/70 hover:text-[#3B1E25] transition-colors flex items-center gap-1 py-2"
                  aria-expanded={desktopCategoriesOpen}
                  aria-haspopup="true"
                >
                  Categories
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      desktopCategoriesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 transition-all duration-150 origin-top ${
                    desktopCategoriesOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="bg-[#FAF8F6] border border-[#EAC7C7] shadow-lg rounded-sm overflow-hidden">
                    <div className="max-h-80 overflow-y-auto py-2">
                      {categoriesLoading ? (
                        <div className="px-4 py-3 text-sm text-[#262626]/60">
                          Loading categories…
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-[#262626]/60">
                          No categories available
                        </div>
                      ) : (
                        categories.map((cat) => (
                          <Link
                            key={cat._id}
                            to={`/category/${cat.slug}`}
                            className="block px-4 py-2.5 text-sm text-[#262626] hover:bg-[#EAC7C7]/20 hover:text-[#3B1E25] transition-colors"
                            onClick={() => setDesktopCategoriesOpen(false)}
                          >
                            {cat.name}
                          </Link>
                        ))
                      )}
                    </div>

                    {!categoriesLoading && categories.length > 0 && (
                      <Link
                        to="/shop"
                        onClick={() => setDesktopCategoriesOpen(false)}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-xs uppercase tracking-[0.15em] text-[#D97466] border-t border-[#EAC7C7] hover:bg-[#EAC7C7]/20 transition-colors"
                      >
                        <Grid className="w-3.5 h-3.5" strokeWidth={1.5} />
                        View all products
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Only show Shop when authenticated AND not admin */}
            {showShopperNav && (
              <Link
                to="/shop"
                className="text-xs uppercase tracking-[0.2em] text-[#262626]/70 hover:text-[#3B1E25] transition-colors"
              >
                Shop All
              </Link>
            )}

            {/* Show Orders link only if authenticated and NOT admin */}
            {showShopperNav && (
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
            {showShopperNav && (
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
            {showShopperNav && (
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
          menuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-5 py-5 flex flex-col gap-1">
          {/* ✅ Mobile Categories */}
          {showShopperNav && (
            <div className="py-3 border-b border-[#EAC7C7]/60">
              <button
                type="button"
                onClick={() => setMobileCategoriesOpen((open) => !open)}
                className="flex items-center justify-between w-full text-xs uppercase tracking-[0.2em] text-[#262626]/70 hover:text-[#3B1E25] transition-colors"
                aria-expanded={mobileCategoriesOpen}
              >
                Categories
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileCategoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-[max-height] duration-200 ${
                  mobileCategoriesOpen ? "max-h-72" : "max-h-0"
                }`}
              >
                <div className="mt-2 space-y-1 max-h-72 overflow-y-auto">
                  {categoriesLoading ? (
                    <div className="py-2 text-sm text-[#262626]/60">
                      Loading…
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="py-2 text-sm text-[#262626]/60">
                      No categories
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/category/${cat.slug}`}
                        className="block px-2 py-2 text-sm text-[#262626] hover:bg-[#EAC7C7]/20 transition-colors"
                        onClick={closeMenu}
                      >
                        {cat.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {showShopperNav && (
            <Link
              to="/shop"
              onClick={closeMenu}
              className="py-3 text-xs uppercase tracking-[0.2em] text-[#262626]/70 hover:text-[#3B1E25] border-b border-[#EAC7C7]/60 transition-colors"
            >
              Shop All
            </Link>
          )}

          {showShopperNav && (
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

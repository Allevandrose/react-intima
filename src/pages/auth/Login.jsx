import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useSelector((state) => state.auth);

  // Get intended redirect path
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    const result = await dispatch(loginUser(formData, rememberMe));

    if (result.success) {
      // ✅ SweetAlert success
      await Swal.fire({
        icon: "success",
        title: "Welcome Back!",
        text: `Hello ${result.user?.email || "User"}`,
        timer: 2000,
        showConfirmButton: false,
        background: "#F7F3EA",
        iconColor: "#B08D4F",
        timerProgressBar: true,
      });

      toast.success("Welcome back!");

      // Redirect based on role
      if (result.role === "admin") {
        navigate("/admin");
      } else {
        navigate(from);
      }
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F7F3EA] py-12 px-4 sm:px-6 lg:px-8 font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .lux-input:focus {
          outline: none;
          border-color: #B08D4F;
          box-shadow: 0 0 0 1px #B08D4F;
        }
        .lux-checkbox {
          accent-color: #14120F;
        }
        .loading-spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid #F7F3EA;
          width: 20px;
          height: 20px;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 border border-[#E6DFD1]">
        <div>
          <h2 className="text-center font-display text-3xl text-[#14120F]">
            Welcome Back
          </h2>
          <p className="mt-3 text-center text-sm text-[#8C7B6B] tracking-wide">
            Sign in to your IntimaCare account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="lux-input block w-full px-4 py-3 bg-white border border-[#D8CFBC] text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="lux-input block w-full px-4 py-3 bg-white border border-[#D8CFBC] text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  disabled={isLoading}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="lux-checkbox h-4 w-4 border-[#D8CFBC]"
                disabled={isLoading}
              />
              <label
                htmlFor="remember-me"
                className="ml-2.5 block text-sm text-[#5C5348]"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="text-[#B08D4F] hover:text-[#8C4B3A] transition-colors tracking-wide"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-[#14120F] text-[#F7F3EA] py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner mr-3"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-[#5C5348] tracking-wide">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#B08D4F] hover:text-[#8C4B3A] transition-colors"
            >
              Create one now
            </Link>
          </p>
        </div>

        <div className="mt-2 p-3.5 bg-[#FBF9F4] border border-[#E6DFD1]">
          <p className="text-xs text-[#5C5348] text-center tracking-wide">
            🔒 Your privacy is our priority. All information is encrypted and
            secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

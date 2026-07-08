import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
      toast.error("Password must contain uppercase, lowercase, and a number");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, formData.password);

      // ✅ SweetAlert success
      await Swal.fire({
        icon: "success",
        title: "Password Reset Successful!",
        text: "You can now login with your new password.",
        timer: 3000,
        showConfirmButton: false,
        background: "#F7F3EA",
        iconColor: "#B08D4F",
        timerProgressBar: true,
      });

      toast.success("Password reset successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
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
            Create New Password
          </h2>
          <p className="mt-3 text-center text-sm text-[#8C7B6B] tracking-wide">
            Enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
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
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#8C7B6B]">
                      {passwordStrength <= 2
                        ? "Weak"
                        : passwordStrength <= 3
                          ? "Fair"
                          : passwordStrength <= 4
                            ? "Good"
                            : "Strong"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#8C7B6B] tracking-wide">
                    Must contain: 8+ chars, uppercase, lowercase, number
                  </p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="lux-input block w-full px-4 py-3 bg-white border border-[#D8CFBC] text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500">
                    Passwords do not match
                  </p>
                )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center bg-[#14120F] text-[#F7F3EA] py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="loading-spinner mr-3"></span>
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-[#B08D4F] hover:text-[#8C4B3A] transition-colors tracking-wide"
            >
              Back to Sign In
            </Link>
          </div>
        </form>

        <div className="mt-2 p-3.5 bg-[#FBF9F4] border border-[#E6DFD1]">
          <p className="text-xs text-[#5C5348] text-center tracking-wide">
            🔒 Password must be at least 8 characters with uppercase, lowercase,
            and a number
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

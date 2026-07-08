import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setIsSent(true);

      // ✅ SweetAlert success
      await Swal.fire({
        icon: "success",
        title: "Reset Link Sent!",
        text: "Check your email for the password reset link.",
        timer: 3000,
        showConfirmButton: false,
        background: "#F7F3EA",
        iconColor: "#B08D4F",
        timerProgressBar: true,
      });

      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
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
            Reset Password
          </h2>
          <p className="mt-3 text-center text-sm text-[#8C7B6B] tracking-wide">
            {isSent
              ? "Check your email for the reset link"
              : "Enter your email to receive a reset link"}
          </p>
        </div>

        {isSent ? (
          <div className="space-y-6">
            <div className="bg-[#FBF9F4] p-5 border border-[#E6DFD1]">
              <p className="text-sm text-[#5C5348] text-center">
                📧 We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
            <div className="text-center">
              <Link
                to="/login"
                className="text-[#B08D4F] hover:text-[#8C4B3A] transition-colors text-sm tracking-wide"
              >
                Back to Sign In
              </Link>
            </div>
            <div className="text-center">
              <button
                onClick={() => setIsSent(false)}
                className="text-sm text-[#8C7B6B] hover:text-[#5C5348] transition-colors"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="lux-input block w-full px-4 py-3 bg-white border border-[#D8CFBC] text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-[#14120F] text-[#F7F3EA] py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner mr-3"></span>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
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
        )}

        <div className="mt-2 p-3.5 bg-[#FBF9F4] border border-[#E6DFD1]">
          <p className="text-xs text-[#5C5348] text-center tracking-wide">
            🔒 The reset link will expire in 1 hour for security
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

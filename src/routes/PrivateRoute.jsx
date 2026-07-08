import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F7F3EA]">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-2 border-[#B08D4F] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-[#8C7B6B] tracking-wide">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Pass the current location so user can be redirected back after login
  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default PrivateRoute;

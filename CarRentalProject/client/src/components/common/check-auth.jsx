//client/src/components/common/check-auth.jsx
import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();
  const path = location.pathname;

  if (path === "/") {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" />;
    } else {
      return user?.role === "admin" ? (
        <Navigate to="/admin/dashboard" />
      ) : (
        <Navigate to="/shop/home" />
      );
    }
  }

  const isAuthPage =
    path.includes("/login") ||
    path.includes("/register") ||
    path.includes("/forgot-password") ||
    path.includes("/reset-password");

  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/auth/login" />;
  }

  if (isAuthenticated && isAuthPage) {
    return user?.role === "admin" ? (
      <Navigate to="/admin/dashboard" />
    ) : (
      <Navigate to="/shop/home" />
    );
  }

  if (isAuthenticated && user?.role !== "admin" && path.startsWith("/admin")) {
    return <Navigate to="/unauth-page" />;
  }

  if (isAuthenticated && user?.role === "admin" && path.startsWith("/shop")) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <>{children}</>;
}

export default CheckAuth;

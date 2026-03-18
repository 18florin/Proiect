//src/App.jsx
import { useIdleTimer } from "react-idle-timer";
import { Route, Routes, useNavigate } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminVehicles from "./pages/admin-view/vehicles";
import AdminReservations from "./pages/admin-view/reservations";
import AdminFeatures from "./pages/admin-view/features";
import ShoppingLayout from "./components/shopping-view/layout";
import NotFound from "./pages/not-found";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingAccount from "./pages/shopping-view/account";
import SearchVehicles from "./pages/shopping-view/search";
import MerchPage from "./pages/shopping-view/merch";
import CartPage from "./pages/shopping-view/cart";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import AuthForgotPassword from "@/pages/auth/forgot-password";
import AuthResetPassword from "@/pages/auth/reset-password";
import AdminCustomers from "@/pages/admin-view/customers";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth, logoutUser } from "./store/auth-slice";
import { Skeleton } from "@/components/ui/skeleton";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth,
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useIdleTimer({
    timeout: 1000 * 60 * 60,
    onIdle: () => {
      dispatch(logoutUser());
      navigate("/auth/login");
    },
    debounce: 500,
  });

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return <Skeleton className="w-[800px] bg-black h-[600px]" />;
  }

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        <Route
          path="/"
          element={<CheckAuth isAuthenticated={isAuthenticated} user={user} />}
        />

        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path="forgot-password" element={<AuthForgotPassword />} />
          <Route path="reset-password/:token" element={<AuthResetPassword />} />
        </Route>

        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>

        <Route
          path="/shop"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShoppingLayout />
            </CheckAuth>
          }
        >
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="search" element={<SearchVehicles />} />
          <Route path="merch" element={<MerchPage />} />
          <Route path="cart" element={<CartPage />} />
        </Route>

        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;

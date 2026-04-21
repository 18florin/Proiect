//src/App.jsx
import { useIdleTimer } from "react-idle-timer";
import { Route, Routes, useNavigate } from "react-router-dom";
import socket from "./socket";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminVehicles from "./pages/admin-view/vehicles";
import AdminReservations from "./pages/admin-view/reservations";
import AdminFeatures from "./pages/admin-view/features";
import AdminMedia from "@/pages/admin-view/media";
import ShoppingLayout from "./components/shopping-view/layout";
import NotFound from "./pages/not-found";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingAccount from "./pages/shopping-view/account";
import SearchVehicles from "./pages/shopping-view/search";
import MerchDetailsPage from "./pages/shopping-view/merch-details";
import MerchPage from "./pages/shopping-view/merch";
import CartPage from "./pages/shopping-view/cart";
import LuceneSearchPage from "@/pages/shopping-view/lucene-search";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import AuthForgotPassword from "@/pages/auth/forgot-password";
import AuthResetPassword from "@/pages/auth/reset-password";
import AdminCustomers from "@/pages/admin-view/customers";

import { fetchAllAddresses } from "./store/shop/address-slice";
import { createNewReservation } from "./store/shop/reservation-slice";
import { getAllReservationsByUserId } from "./store/shop/reservation-slice";

import PageLoader from "./components/common/PageLoader";

import { useDispatch, useSelector } from "react-redux";
import { setUser, checkAuth, logoutUser } from "./store/auth-slice";

import { MobileContext } from "./context/mobile-context";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth,
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState("");
  const [isMobileConnected, setIsMobileConnected] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);

  useIdleTimer({
    timeout: 1000 * 60 * 60,
    onIdle: () => {
      dispatch(logoutUser());
      localStorage.removeItem("token");
      navigate("/auth/login");
    },
    debounce: 500,
  });

  // 🔐 CHECK AUTH
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // 🔐 FETCH ADDRESS DOAR CU TOKEN VALID
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      dispatch(fetchAllAddresses(user._id));
    }
  }, [dispatch, isAuthenticated, user?._id]);

  // 🔥 SESSION + SOCKET
  useEffect(() => {
    let id = localStorage.getItem("sessionId");

    if (!id) {
      id = uuidv4();
      localStorage.setItem("sessionId", id);
    }

    setSessionId(id);

    socket.on("connect", () => {
      socket.emit("join-session", id);
    });

    socket.emit("join-session", id);

    return () => {
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    socket.on("receive-location", (coords) => {
      console.log("🖥 Received GPS:", coords);
      setGpsLocation(coords);
    });

    return () => {
      socket.off("receive-location");
    };
  }, []);

  // 🔥 SOCKET EVENTS
  useEffect(() => {
    socket.on("mobile-connected", () => {
      setIsMobileConnected(true);
    });

    // 🔥 LOGIN REAL DIN TELEFON
    socket.on("desktop-login", ({ user, token }) => {
      console.log("📱 Token received from phone:", token);

      // 🔥 salvează token
      localStorage.setItem("token", token);

      // 🔥 setează user
      dispatch(setUser(user));

      // 🔥 FETCH REZERVĂRI IMEDIAT
      dispatch(getAllReservationsByUserId(user.id));
    });

    socket.on("approval-result", async ({ approved, payload }) => {
      console.log("🔥 Approval result:", approved, payload);

      if (!approved) {
        console.log("❌ Rejected from phone");
        return;
      }

      try {
        const res = await dispatch(createNewReservation(payload)).unwrap();

        console.log("✅ Reservation created:", res);

        // 🔥 REFRESH LIST USER
        dispatch(getAllReservationsByUserId(payload.userId));
      } catch (err) {
        console.error("❌ Reservation error:", err);
      }
    });

    return () => {
      socket.off("mobile-connected");
      socket.off("desktop-login");
      socket.off("approval-result");
    };
  }, [dispatch]);

  if (isLoading) return <PageLoader />;

  return (
    <MobileContext.Provider value={{ isMobileConnected, sessionId }}>
      <div className="flex flex-col overflow-hidden bg-white">
        <Routes>
          <Route
            path="/"
            element={
              <CheckAuth isAuthenticated={isAuthenticated} user={user} />
            }
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
            <Route
              path="reset-password/:token"
              element={<AuthResetPassword />}
            />
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
            <Route path="media" element={<AdminMedia />} />
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
            <Route path="merch/:id" element={<MerchDetailsPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="lucene-search" element={<LuceneSearchPage />} />
          </Route>

          <Route path="/unauth-page" element={<UnauthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </MobileContext.Provider>
  );
}

export default App;

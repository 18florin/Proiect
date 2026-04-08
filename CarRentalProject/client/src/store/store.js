import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminVehiclesSlice from "./admin/vehicles-slice";
import adminReservationsSlice from "./admin/reservation-slice";
import adminCustomersReducer from "./admin/customers-slice";

import shopVehiclesSlice from "./shop/vehicles-slice";
import shopAddressSlice from "./shop/address-slice";
import shopReservationSlice from "./shop/reservation-slice";
import shopSearchSlice from "./shop/search-slice";
import shopReviewSlice from "./shop/review-slice";
import cartReducer from "./shop/cart-slice";
import commonFeatureSlice from "./common-slice";
import shopSavedSlice from "./shop/saved-slice";
import mobileReducer from "./mobile-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    mobile: mobileReducer,

    adminVehicles: adminVehiclesSlice,
    adminReservations: adminReservationsSlice,
    adminCustomers: adminCustomersReducer,

    shopVehicles: shopVehiclesSlice,
    shopAddress: shopAddressSlice,
    shopReservation: shopReservationSlice,
    shopSearch: shopSearchSlice,
    shopReview: shopReviewSlice,
    merchCart: cartReducer,

    shopSaved: shopSavedSlice,

    commonFeature: commonFeatureSlice,
  },
});

export default store;

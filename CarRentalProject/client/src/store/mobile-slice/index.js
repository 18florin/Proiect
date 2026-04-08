import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connected: false,
  approvalStatus: "idle",
  pendingReservation: null,
  gpsData: null,
};

const mobileSlice = createSlice({
  name: "mobile",
  initialState,
  reducers: {
    connectMobile: (state) => {
      state.connected = true;
    },

    disconnectMobile: (state) => {
      state.connected = false;
      state.approvalStatus = "idle";
      state.pendingReservation = null;
      state.gpsData = null;
    },

    setPendingMobileApproval: (state, action) => {
      state.approvalStatus = "waiting";
      state.pendingReservation = action.payload;
      state.gpsData = null;
    },

    approveMobileReservation: (state) => {
      if (state.pendingReservation) {
        state.approvalStatus = "approved";
      }
    },

    rejectMobileReservation: (state) => {
      if (state.pendingReservation) {
        state.approvalStatus = "rejected";
      }
    },

    markReservationSubmittedToAdmins: (state) => {
      state.pendingReservation = null;
    },

    resetMobileApproval: (state) => {
      state.approvalStatus = "idle";
      state.pendingReservation = null;
      state.gpsData = null;
    },

    setGpsData: (state, action) => {
      if (state.connected && state.approvalStatus === "approved") {
        state.gpsData = action.payload;
      }
    },

    clearGps: (state) => {
      state.gpsData = null;
    },
  },
});

export const {
  connectMobile,
  disconnectMobile,
  setPendingMobileApproval,
  approveMobileReservation,
  rejectMobileReservation,
  markReservationSubmittedToAdmins,
  resetMobileApproval,
  setGpsData,
  clearGps,
} = mobileSlice.actions;

export default mobileSlice.reducer;

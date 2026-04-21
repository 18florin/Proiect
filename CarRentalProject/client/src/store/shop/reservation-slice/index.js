import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  reservationList: [],
  reservationDetails: null,
};

// 🔥 helper pentru token
function getAuthConfig() {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

// 🔥 CREATE
export const createNewReservation = createAsyncThunk(
  "shopReservation/createNewReservation",
  async ({ userId, vehicles, startDate, endDate, addressInfo }) => {
    const response = await axios.post(
      "http://localhost:5000/api/shop/reservation/create",
      { userId, vehicles, startDate, endDate, addressInfo },
      getAuthConfig(),
    );
    return response.data;
  },
);

// 🔥 GET ALL
export const getAllReservationsByUserId = createAsyncThunk(
  "shopReservation/getAllReservationsByUserId",
  async (userId) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/reservation/list/${userId}`,
      getAuthConfig(),
    );
    return response.data;
  },
);

// 🔥 DETAILS
export const getReservationDetails = createAsyncThunk(
  "shopReservation/getReservationDetails",
  async (reservationId) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/reservation/details/${reservationId}`,
      getAuthConfig(),
    );
    return response.data;
  },
);

// 🔥 CANCEL
export const cancelReservation = createAsyncThunk(
  "shopReservation/cancelReservation",
  async (reservationId) => {
    const response = await axios.delete(
      `http://localhost:5000/api/shop/reservation/cancel/${reservationId}`,
      getAuthConfig(),
    );
    return response.data;
  },
);

const slice = createSlice({
  name: "shopReservation",
  initialState,
  reducers: {
    resetReservationDetails(state) {
      state.reservationDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewReservation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewReservation.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createNewReservation.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(getAllReservationsByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllReservationsByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reservationList = action.payload.data;
      })
      .addCase(getAllReservationsByUserId.rejected, (state) => {
        state.isLoading = false;
        state.reservationList = [];
      })

      .addCase(getReservationDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReservationDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reservationDetails = action.payload.data;
      })
      .addCase(getReservationDetails.rejected, (state) => {
        state.isLoading = false;
        state.reservationDetails = null;
      })

      .addCase(cancelReservation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.data;

        const idx = state.reservationList.findIndex(
          (r) => r._id === updated._id,
        );

        if (idx !== -1) {
          state.reservationList[idx] = updated;
        }

        if (state.reservationDetails?._id === updated._id) {
          state.reservationDetails = updated;
        }
      })
      .addCase(cancelReservation.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { resetReservationDetails } = slice.actions;
export default slice.reducer;

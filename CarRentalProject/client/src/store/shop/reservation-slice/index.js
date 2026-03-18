import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  reservationList: [],
  reservationDetails: null,
};

export const createNewReservation = createAsyncThunk(
  "shopReservation/createNewReservation",
  async ({ userId, vehicles, startDate, endDate, addressInfo }) => {
    const response = await axios.post(
      "/api/shop/reservation/create",
      { userId, vehicles, startDate, endDate, addressInfo },
      { withCredentials: true }
    );
    return response.data;
  }
);

export const getAllReservationsByUserId = createAsyncThunk(
  "shopReservation/getAllReservationsByUserId",
  async (userId) => {
    const response = await axios.get(`/api/shop/reservation/list/${userId}`, {
      withCredentials: true,
    });
    return response.data;
  }
);

export const getReservationDetails = createAsyncThunk(
  "shopReservation/getReservationDetails",
  async (reservationId) => {
    const response = await axios.get(
      `/api/shop/reservation/details/${reservationId}`,
      { withCredentials: true }
    );
    return response.data;
  }
);

export const cancelReservation = createAsyncThunk(
  "shopReservation/cancelReservation",
  async (reservationId) => {
    const response = await axios.delete(
      `/api/shop/reservation/cancel/${reservationId}`,
      { withCredentials: true }
    );
    return response.data;
  }
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
          (r) => r._id === updated._id
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

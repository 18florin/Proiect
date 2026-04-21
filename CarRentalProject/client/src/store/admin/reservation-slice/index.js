//client/src/store/admin/reservation-slice/index.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

const initialState = {
  list: [],
  details: null,
  loading: false,
  error: null,
};

// 🔥 CONFIG CU TOKEN
function getAuthConfig() {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

// 🔥 GET ALL
export const getAllReservationsForAdmin = createAsyncThunk(
  "adminReservations/getAll",
  async () => {
    const { data } = await axios.get(
      `${BASE_URL}/api/admin/reservations`,
      getAuthConfig(),
    );
    return data;
  },
);

// 🔥 GET DETAILS
export const getReservationDetailsForAdmin = createAsyncThunk(
  "adminReservations/getOne",
  async (id) => {
    const { data } = await axios.get(
      `${BASE_URL}/api/admin/reservations/${id}`,
      getAuthConfig(),
    );
    return data;
  },
);

// 🔥 UPDATE STATUS
export const updateReservationStatus = createAsyncThunk(
  "adminReservations/updateStatus",
  async ({ id, reservationStatus }) => {
    const { data } = await axios.put(
      `${BASE_URL}/api/admin/reservations/${id}/status`,
      { reservationStatus },
      getAuthConfig(),
    );
    return data;
  },
);

const slice = createSlice({
  name: "adminReservations",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(getAllReservationsForAdmin.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(getAllReservationsForAdmin.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.data;
      })
      .addCase(getAllReservationsForAdmin.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      })

      .addCase(getReservationDetailsForAdmin.fulfilled, (s, a) => {
        s.details = a.payload.data;
      })

      .addCase(updateReservationStatus.fulfilled, (s, a) => {
        const idx = s.list.findIndex((r) => r._id === a.payload.data._id);
        if (idx > -1) s.list[idx] = a.payload.data;

        if (s.details?._id === a.payload.data._id) {
          s.details = a.payload.data;
        }
      });
  },
});

export default slice.reducer;

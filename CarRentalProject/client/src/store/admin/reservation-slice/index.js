import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  list: [],
  details: null,
  loading: false,
  error: null,
};

export const getAllReservationsForAdmin = createAsyncThunk(
  "adminReservations/getAll",
  async () => {
    const { data } = await axios.get("/api/admin/reservations", {
      withCredentials: true,
    });
    return data;
  },
);

export const getReservationDetailsForAdmin = createAsyncThunk(
  "adminReservations/getOne",
  async (id) => {
    const { data } = await axios.get(`/api/admin/reservations/${id}`, {
      withCredentials: true,
    });
    return data;
  },
);

export const updateReservationStatus = createAsyncThunk(
  "adminReservations/updateStatus",
  async ({ id, reservationStatus }) => {
    const { data } = await axios.put(
      `/api/admin/reservations/${id}/status`,
      { reservationStatus },
      { withCredentials: true },
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
        if (s.details?._id === a.payload.data._id) s.details = a.payload.data;
      });
  },
});

export default slice.reducer;

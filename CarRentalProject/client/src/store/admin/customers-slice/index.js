import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCustomers = createAsyncThunk(
  "adminCustomers/fetchAll",
  async (search = "") => {
    const { data } = await axios.get(
      `/api/admin/customers${
        search ? `?search=${encodeURIComponent(search)}` : ""
      }`,
      { withCredentials: true }
    );
    return data;
  }
);

const initialState = {
  isLoading: false,
  customers: [],
  error: null,
};

const customersSlice = createSlice({
  name: "adminCustomers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload.data;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export default customersSlice.reducer;

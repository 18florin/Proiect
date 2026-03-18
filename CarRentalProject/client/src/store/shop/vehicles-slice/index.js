import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  vehicleList: [],
  vehicleDetails: null,
  error: null,
};

export const fetchAllFilteredVehicles = createAsyncThunk(
  "shopVehicles/fetchAllFilteredVehicles",
  async (
    { filterParams = {}, sortParams, maxPrice, location },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();

      if (
        Array.isArray(filterParams.category) &&
        filterParams.category.length
      ) {
        params.set("category", filterParams.category.join(","));
      }
      if (Array.isArray(filterParams.brand) && filterParams.brand.length) {
        params.set("brand", filterParams.brand.join(","));
      }

      if (maxPrice) {
        params.set("maxPrice", maxPrice);
      }
      if (location) {
        params.set("location", location);
      }

      if (sortParams) {
        params.set("sortBy", sortParams);
      }

      const { data } = await axios.get(
        `http://localhost:5000/api/shop/vehicles/get?${params.toString()}`,
        { withCredentials: true }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchVehicleDetails = createAsyncThunk(
  "shopVehicles/fetchVehicleDetails",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/shop/vehicles/get/${id}`,
        { withCredentials: true }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const shopVehiclesSlice = createSlice({
  name: "shopVehicles",
  initialState,
  reducers: {
    setVehicleDetails(state) {
      state.vehicleDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllFilteredVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicleList = action.payload.data;
      })
      .addCase(fetchAllFilteredVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchVehicleDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVehicleDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicleDetails = action.payload.data;
      })
      .addCase(fetchVehicleDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setVehicleDetails } = shopVehiclesSlice.actions;
export default shopVehiclesSlice.reducer;

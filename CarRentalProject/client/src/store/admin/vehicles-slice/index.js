import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  vehicleList: [],
};

export const addNewVehicle = createAsyncThunk(
  "/vehicles/addNewVehicle",
  async (formData) => {
    const result = await axios.post(
      "http://localhost:5000/api/admin/vehicles/add",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return result?.data;
  }
);

export const fetchAllVehicles = createAsyncThunk(
  "/vehicles/fetchAllVehicles",
  async () => {
    const result = await axios.get(
      "http://localhost:5000/api/admin/vehicles/get"
    );
    return result?.data;
  }
);

export const editVehicle = createAsyncThunk(
  "/vehicles/editVehicle",
  async ({ id, formData }) => {
    const result = await axios.put(
      `http://localhost:5000/api/admin/vehicles/edit/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return result?.data;
  }
);

export const deleteVehicle = createAsyncThunk(
  "/vehicles/deleteVehicle",
  async (id) => {
    const result = await axios.delete(
      `http://localhost:5000/api/admin/vehicles/delete/${id}`
    );
    return result?.data;
  }
);

const AdminVehiclesSlice = createSlice({
  name: "adminVehicles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllVehicles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicleList = action.payload.data;
      })
      .addCase(fetchAllVehicles.rejected, (state) => {
        state.isLoading = false;
        state.vehicleList = [];
      });
  },
});

export default AdminVehiclesSlice.reducer;

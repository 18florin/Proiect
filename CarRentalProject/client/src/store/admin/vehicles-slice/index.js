//client/src/store/admin/vehicles-slice/index.js
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
      },
    );
    return result?.data;
  },
);

export const fetchAllVehicles = createAsyncThunk(
  "/vehicles/fetchAllVehicles",
  async () => {
    const result = await axios.get(
      "http://localhost:5000/api/admin/vehicles/get",
    );
    return result?.data;
  },
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
      },
    );
    return result?.data;
  },
);

export const deleteVehicle = createAsyncThunk(
  "/vehicles/deleteVehicle",
  async (id) => {
    const result = await axios.delete(
      `http://localhost:5000/api/admin/vehicles/delete/${id}`,
    );
    return result?.data;
  },
);

export const uploadEditedVehicleImage = createAsyncThunk(
  "/vehicles/uploadEditedVehicleImage",
  async (file) => {
    const formData = new FormData();
    formData.append("images", file);

    const result = await axios.post(
      "http://localhost:5000/api/admin/vehicles/upload-images",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return result?.data;
  },
);

export const uploadVehicleVideo = createAsyncThunk(
  "/vehicles/uploadVehicleVideo",
  async (file) => {
    const formData = new FormData();
    formData.append("images", file);

    const result = await axios.post(
      "http://localhost:5000/api/admin/vehicles/upload-images",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return result?.data;
  },
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
      })

      .addCase(editVehicle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editVehicle.fulfilled, (state, action) => {
        state.isLoading = false;

        const updatedVehicle = action.payload.data;
        state.vehicleList = state.vehicleList.map((vehicle) =>
          vehicle._id === updatedVehicle._id ? updatedVehicle : vehicle,
        );
      })
      .addCase(editVehicle.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(deleteVehicle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(deleteVehicle.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default AdminVehiclesSlice.reducer;

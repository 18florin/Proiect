import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  addressList: [],
  isLoading: false,
  error: null,
};

export const fetchAllAddresses = createAsyncThunk(
  "shopAddress/fetchAllAddresses",
  async () => {
    const { data } = await axios.get("/api/shop/address", {
      withCredentials: true,
    });
    return data;
  }
);

export const addNewAddress = createAsyncThunk(
  "shopAddress/addNewAddress",
  async (formData) => {
    const { data } = await axios.post("/api/shop/address", formData, {
      withCredentials: true,
    });
    return data;
  }
);

export const updateAddress = createAsyncThunk(
  "shopAddress/updateAddress",
  async ({ addressId, formData }) => {
    const { data } = await axios.put(
      `/api/shop/address/${addressId}`,
      formData,
      { withCredentials: true }
    );
    return data;
  }
);

export const deleteAddress = createAsyncThunk(
  "shopAddress/deleteAddress",
  async (addressId) => {
    const { data } = await axios.delete(`/api/shop/address/${addressId}`, {
      withCredentials: true,
    });
    return data;
  }
);

const slice = createSlice({
  name: "shopAddress",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addressList = action.payload.data;
      })
      .addCase(fetchAllAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      .addCase(addNewAddress.fulfilled, (state, action) => {
        state.addressList.push(action.payload.data);
      })

      .addCase(updateAddress.fulfilled, (state, action) => {
        const idx = state.addressList.findIndex(
          (a) => a._id === action.payload.data._id
        );
        if (idx > -1) state.addressList[idx] = action.payload.data;
      })

      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addressList = state.addressList.filter(
          (a) => a._id !== action.meta.arg
        );
      });
  },
});

export default slice.reducer;

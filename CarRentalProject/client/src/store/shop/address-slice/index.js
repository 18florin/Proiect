import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

const initialState = {
  addressList: [],
  isLoading: false,
  error: null,
};

function getAuthConfig() {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export const fetchAllAddresses = createAsyncThunk(
  "shopAddress/fetchAllAddresses",
  async () => {
    const { data } = await axios.get(
      `${BASE_URL}/api/shop/address`,
      getAuthConfig(),
    );
    return data;
  },
);

export const addNewAddress = createAsyncThunk(
  "shopAddress/addNewAddress",
  async (formData) => {
    const { data } = await axios.post(
      `${BASE_URL}/api/shop/address`,
      formData,
      getAuthConfig(),
    );
    return data;
  },
);

export const updateAddress = createAsyncThunk(
  "shopAddress/updateAddress",
  async ({ addressId, formData }) => {
    const { data } = await axios.put(
      `${BASE_URL}/api/shop/address/${addressId}`,
      formData,
      getAuthConfig(),
    );
    return data;
  },
);

export const deleteAddress = createAsyncThunk(
  "shopAddress/deleteAddress",
  async (addressId) => {
    const { data } = await axios.delete(
      `${BASE_URL}/api/shop/address/${addressId}`,
      getAuthConfig(),
    );
    return data;
  },
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
          (a) => a._id === action.payload.data._id,
        );
        if (idx > -1) state.addressList[idx] = action.payload.data;
      })

      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addressList = state.addressList.filter(
          (a) => a._id !== action.meta.arg,
        );
      });
  },
});

export default slice.reducer;

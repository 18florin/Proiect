import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  savedList: [],
};

export const fetchSaved = createAsyncThunk(
  "saved/fetchSaved",
  async (userId) => {
    const res = await axios.get(`/api/shop/saved/${userId}`);
    return res.data.data;
  }
);

export const addSaved = createAsyncThunk(
  "saved/addSaved",
  async ({ userId, vehicleId }) => {
    const res = await axios.post(`/api/shop/saved/add`, { userId, vehicleId });
    return vehicleId;
  }
);

export const removeSaved = createAsyncThunk(
  "saved/removeSaved",
  async ({ userId, vehicleId }) => {
    await axios.delete(`/api/shop/saved/remove/${userId}/${vehicleId}`);
    return vehicleId;
  }
);

const savedSlice = createSlice({
  name: "shopSaved",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSaved.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(fetchSaved.fulfilled, (s, a) => {
        s.isLoading = false;
        s.savedList = a.payload;
      })
      .addCase(fetchSaved.rejected, (s) => {
        s.isLoading = false;
      })
      .addCase(addSaved.fulfilled, (s, a) => {
        s.savedList.push(a.payload);
      })
      .addCase(removeSaved.fulfilled, (s, a) => {
        s.savedList = s.savedList.filter((id) => id !== a.payload);
      });
  },
});

export default savedSlice.reducer;

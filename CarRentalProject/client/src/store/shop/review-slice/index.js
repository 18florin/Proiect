import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  reviews: [],
  error: null,
};

export const getReviews = createAsyncThunk(
  "shopReview/getReviews",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/shop/review/${productId}`, {
        withCredentials: true,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addReview = createAsyncThunk(
  "shopReview/addReview",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/shop/review", formData, {
        withCredentials: true,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const slice = createSlice({
  name: "shopReview",
  initialState,
  reducers: {
    clearReviews(state) {
      state.reviews = [];
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReviews.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(getReviews.fulfilled, (s, a) => {
        s.isLoading = false;
        s.reviews = a.payload.data;
      })
      .addCase(getReviews.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
        s.reviews = [];
      })
      .addCase(addReview.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(addReview.fulfilled, (s, a) => {
        s.isLoading = false;
        s.reviews.unshift(a.payload.data);
      })
      .addCase(addReview.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload;
      });
  },
});

export const { clearReviews } = slice.actions;
export default slice.reducer;

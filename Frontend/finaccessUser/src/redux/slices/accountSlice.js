import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";


export const fetchMyAccounts = createAsyncThunk(
  "accounts/fetchMyAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/accounts/mine");
      return response.data.accounts;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Erreur de chargement.");
    }
  }
);

const accountSlice = createSlice({
  name: "accounts",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAccounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default accountSlice.reducer;

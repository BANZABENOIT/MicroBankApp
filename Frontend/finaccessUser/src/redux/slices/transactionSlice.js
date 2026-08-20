import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

export const fetchMyTransactions = createAsyncThunk(
  "transactions/fetchMyTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/transactions");
      return response.data.transactions;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Erreur de chargement.");
    }
  }
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default transactionSlice.reducer;

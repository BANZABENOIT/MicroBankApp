import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";


export const fetchSavings = createAsyncThunk(
  "savings/fetchSavings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/savings");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Erreur de chargement.");
    }
  }
);

export const depositSavings = createAsyncThunk(
  "savings/depositSavings",
  async (amount, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/savings/deposit", { amount });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Erreur lors du dépôt.");
    }
  }
);

export const withdrawSavings = createAsyncThunk(
  "savings/withdrawSavings",
  async (amount, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/savings/withdraw", { amount });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Erreur lors du retrait.");
    }
  }
);

const savingsSlice = createSlice({
  name: "savings",
  initialState: {
    balance: 0,
    history: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSavings.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.history = action.payload.history;
      })
      .addCase(fetchSavings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(depositSavings.fulfilled, (state, action) => {
        state.balance = action.payload.balance;
      })
      .addCase(withdrawSavings.fulfilled, (state, action) => {
        state.balance = action.payload.balance;
      });
  },
});

export default savingsSlice.reducer;

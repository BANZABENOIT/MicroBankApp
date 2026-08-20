import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";


export const fetchMyCredits = createAsyncThunk(
  "credits/fetchMyCredits",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/loans/mine");
      return response.data.loans;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Erreur de chargement.");
    }
  }
);

export const fetchCreditDetail = createAsyncThunk(
  "credits/fetchCreditDetail",
  async (creditId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/loans/${creditId}`);
      return response.data.loan;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Crédit introuvable.");
    }
  }
);

export const requestCredit = createAsyncThunk(
  "credits/requestCredit",
  async (creditData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/loans", creditData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la demande.");
    }
  }
);

export const makeRepayment = createAsyncThunk(
  "credits/makeRepayment",
  async ({ creditId, amount }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/loans/${creditId}/repay`, { amount });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Erreur lors du remboursement.");
    }
  }
);

const creditSlice = createSlice({
  name: "credits",
  initialState: {
    items: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyCredits.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyCredits.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyCredits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCreditDetail.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(requestCredit.pending, (state) => {
        state.loading = true;
      })
      .addCase(requestCredit.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestCredit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default creditSlice.reducer;

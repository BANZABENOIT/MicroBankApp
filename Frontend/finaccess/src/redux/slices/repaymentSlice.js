import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

export const fetchCreditForRepayment = createAsyncThunk(
  "repayments/fetchCredit",
  async (creditId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/loans/${creditId}`);
      return response.data.loan;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Crédit introuvable."
      );
    }
  }
);

export const recordRepayment = createAsyncThunk(
  "repayments/recordRepayment",
  async (repaymentData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/repayments", repaymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de l'enregistrement."
      );
    }
  }
);

const repaymentSlice = createSlice({
  name: "repayments",
  initialState: {
    selectedCredit: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreditForRepayment.fulfilled, (state, action) => {
        state.selectedCredit = action.payload;
      })
      .addCase(recordRepayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordRepayment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(recordRepayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default repaymentSlice.reducer;

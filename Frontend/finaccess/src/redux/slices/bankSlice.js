import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

const apiError = (error, fallback) => error.response?.data?.message || fallback;

export const fetchBank = createAsyncThunk(
  "bank/fetchBank",
  async (_, { rejectWithValue }) => {
    try {
      const [summary, history] = await Promise.all([
        axiosClient.get("/admin/bank"),
        axiosClient.get("/admin/bank/history"),
      ]);
      return {
        summary: summary.data.bank,
        movements: history.data.movements,
      };
    } catch (error) {
      return rejectWithValue(
        apiError(error, "Impossible de charger la banque."),
      );
    }
  },
);

const operation = (path, type) =>
  createAsyncThunk(`bank/${type}`, async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(path, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiError(error, "Opération bancaire impossible."));
    }
  });

export const depositToAccount = operation("/admin/bank/deposit", "deposit");
export const withdrawFromAccount = operation(
  "/admin/bank/withdraw",
  "withdraw",
);
export const injectCapital = operation("/admin/bank/capital", "capital");

const bankSlice = createSlice({
  name: "bank",
  initialState: {
    summary: null,
    movements: [],
    loading: false,
    operating: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBank.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.movements = action.payload.movements;
      })
      .addCase(fetchBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addMatcher(
        (action) =>
          [
            depositToAccount.pending.type,
            withdrawFromAccount.pending.type,
            injectCapital.pending.type,
          ].includes(action.type),
        (state) => {
          state.operating = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          [
            depositToAccount.fulfilled.type,
            withdrawFromAccount.fulfilled.type,
            injectCapital.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.operating = false;
          state.summary = action.payload.bank;
        },
      )
      .addMatcher(
        (action) =>
          [
            depositToAccount.rejected.type,
            withdrawFromAccount.rejected.type,
            injectCapital.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.operating = false;
          state.error = action.payload;
        },
      );
  },
});

export default bankSlice.reducer;

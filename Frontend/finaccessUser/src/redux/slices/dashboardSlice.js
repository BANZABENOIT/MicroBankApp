import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

export const fetchClientDashboard = createAsyncThunk(
  "dashboard/fetchClientDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/dashboard");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Erreur de chargement.");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    totalBalance: 0,
    activeCreditsAmount: 0,
    totalSavings: 0,
    upcomingPayments: 0,
    creditsOverview: { inProgress: 0, completed: 0, pending: 0 },
    recentTransactions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClientDashboard.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchClientDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;

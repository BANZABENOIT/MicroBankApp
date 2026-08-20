import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

export const fetchCreditRequests = createAsyncThunk(
  "creditRequests/fetchCreditRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/loans");
      return response.data.loans;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur de chargement."
      );
    }
  }
);

export const approveCreditRequest = createAsyncThunk(
  "creditRequests/approve",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.post(`/loans/${id}/approve`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de l'approbation."
      );
    }
  }
);

export const rejectCreditRequest = createAsyncThunk(
  "creditRequests/reject",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.post(`/loans/${id}/reject`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors du refus."
      );
    }
  }
);

const creditRequestSlice = createSlice({
  name: "creditRequests",
  initialState: {
    items: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    selectRequest: (state, action) => {
      state.selected = state.items.find((r) => r.id === action.payload) || null;
    },
    clearSelection: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreditRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCreditRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCreditRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveCreditRequest.fulfilled, (state, action) => {
        const req = state.items.find((r) => r.id === action.payload);
        if (req) req.status = "approved";
        state.selected = null;
      })
      .addCase(rejectCreditRequest.fulfilled, (state, action) => {
        const req = state.items.find((r) => r.id === action.payload);
        if (req) req.status = "rejected";
        state.selected = null;
      });
  },
});

export const { selectRequest, clearSelection } = creditRequestSlice.actions;
export default creditRequestSlice.reducer;

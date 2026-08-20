import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../api/axiosClient";

export const fetchClients = createAsyncThunk(
  "clients/fetchClients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/clients");
      return response.data.clients;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur de chargement."
      );
    }
  }
);

export const createClient = createAsyncThunk(
  "clients/createClient",
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/clients", clientData);
      return response.data.client;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de l'ajout."
      );
    }
  }
);

export const updateClientStatus = createAsyncThunk(
  "clients/updateClientStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await axiosClient.put(`/clients/${id}/status`, { status });
      return { id, status };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors de la mise à jour."
      );
    }
  }
);

const clientSlice = createSlice({
  name: "clients",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateClientStatus.fulfilled, (state, action) => {
        const client = state.items.find((c) => c.id === action.payload.id);
        if (client) client.status = action.payload.status;
      });
  },
});

export default clientSlice.reducer;

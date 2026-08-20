import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";
import profileReducer from "./slices/profileSlice";
import creditReducer from "./slices/creditSlice";
import savingsReducer from "./slices/savingsSlice";
import accountReducer from "./slices/accountSlice";
import transactionReducer from "./slices/transactionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    profile: profileReducer,
    credits: creditReducer,
    savings: savingsReducer,
    accounts: accountReducer,
    transactions: transactionReducer,
  },
});

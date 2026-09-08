import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import clientReducer from "./slices/clientSlice";
import creditRequestReducer from "./slices/creditRequestSlice";
import accountReducer from "./slices/accountSlice";
import repaymentReducer from "./slices/repaymentSlice";
import transactionReducer from "./slices/transactionSlice";
import dashboardReducer from "./slices/dashboardSlice";
import bankReducer from "./slices/bankSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer,
    creditRequests: creditRequestReducer,
    accounts: accountReducer,
    repayments: repaymentReducer,
    transactions: transactionReducer,
    dashboard: dashboardReducer,
    bank: bankReducer,
  },
});

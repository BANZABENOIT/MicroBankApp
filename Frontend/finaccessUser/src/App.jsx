import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Credits from "./pages/Credits";
import CreditDetail from "./pages/CreditDetail";
import Savings from "./pages/Savings";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Repayments from "./pages/Repayments";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/credits" element={<PrivateRoute><Credits /></PrivateRoute>} />
        <Route path="/credits/:id" element={<PrivateRoute><CreditDetail /></PrivateRoute>} />
        <Route path="/savings" element={<PrivateRoute><Savings /></PrivateRoute>} />
        <Route path="/accounts" element={<PrivateRoute><Accounts /></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
        <Route path="/repayments" element={<PrivateRoute><Repayments /></PrivateRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

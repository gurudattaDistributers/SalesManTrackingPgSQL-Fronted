import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import SuccessPage from "./pages/SuccessPage";
import SalesmanLogin from "./pages/SalesmanLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerForm from "./components/CustomerForm";
import InvoicePreview from "./components/InvoicePreview";
import SalesmanInfo from "./components/SalesmanInfo";
import CustomerInfo from "./components/CustomerInfo";
import CreateNewSalesman from "./components/CreateNewSalesman";
import SalesmanEdit from "./components/SalesmanEdit";
import SalesmanDelete from "./components/SalesmanDelete.jsx";
import CustomerUpdate from "./components/CustomerUpdate.jsx";

const App = () => {
  return (
     <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/salesman-login" element={<SalesmanLogin />} />


        <Route path="/customer-form" element={<ProtectedRoute roles={["Salesman"]}> <CustomerForm /> </ProtectedRoute>} />

        <Route path="/invoice-preview" element={<ProtectedRoute roles={["Salesman"]}> <InvoicePreview /> </ProtectedRoute>} />

        <Route path="/success" element={<ProtectedRoute roles={["Salesman"]}><SuccessPage /> </ProtectedRoute>} />

        <Route path="/admin-dashboard" element={<ProtectedRoute roles={["Admin"]}><AdminDashboard /></ProtectedRoute>} />


        <Route path="/salesman-info" element={<ProtectedRoute roles={["Admin"]}><SalesmanInfo /></ProtectedRoute>} />

        <Route path="/customer-info" element={<ProtectedRoute roles={["Admin"]}><CustomerInfo /></ProtectedRoute>} />

        <Route path="/create-salesman" element={<ProtectedRoute roles={["Admin"]}><CreateNewSalesman /></ProtectedRoute>} />

        <Route path="/edit-salesman/:pin" element={<ProtectedRoute roles={["Admin"]}><SalesmanEdit /></ProtectedRoute>} />

        <Route path="/delete-salesman/:pin" element={<ProtectedRoute roles={["Admin"]}><SalesmanDelete /></ProtectedRoute>} />

        <Route path="/update-customer/:id" element={<ProtectedRoute roles={["Admin"]}><CustomerUpdate /></ProtectedRoute>} />
        
      </Routes>
    </Router>
    </AuthProvider>
  );
};

export default App;

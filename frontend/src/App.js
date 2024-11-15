import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import MyDocuments from "./pages/MyDocuments";
import MyProfile from "./pages/MyProfile";
import Agreements from "./pages/Agreements";
import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute component
import AdminPage from "./pages/AdminPage";
import AdminDocumentsPage from "./pages/AdminDocumentsPage";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={<PrivateRoute element={Dashboard} />}
        />
        <Route
          path="/my-documents"
          element={<PrivateRoute element={MyDocuments} />}
        />
        <Route
          path="/my-profile"
          element={<PrivateRoute element={MyProfile} />}
        />
        <Route
          path="/agreements"
          element={<PrivateRoute element={Agreements} />}
        />

        <Route path="/admin" element={<PrivateRoute element={AdminPage} />} />

        <Route
          path="/admin-documents"
          element={<PrivateRoute element={AdminDocumentsPage} />}
        />
      </Routes>
    </Router>
  );
};

export default App;

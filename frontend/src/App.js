import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import MyDocuments from "./pages/MyDocuments";
import MyProfile from "./pages/MyProfile";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-documents" element={<MyDocuments />} />
        <Route path="/my-profile" element={<MyProfile />} />
      </Routes>
    </Router>
  );
};

export default App;

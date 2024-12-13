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
import Home from "./pages/Home";
import AllUsersPage from "./pages/AllUsersPage";
import ExportDataPage from "./pages/ExportDataPage";
import MyOrganization from "./pages/MyOrganization";
import HolidayManager from "./pages/HolidayManager";
import MyLeaves from "./components/MyLeaves";
import PublicHolidays from "./components/PublicHolidays";
import Timesheet from "./pages/Timesheet";
import TimesheetSubmitPage from "./pages/TimesheetSubmitPage";
import SalaryGeneration from "./pages/SalaryGeneration";

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

        <Route path="/home" element={<PrivateRoute element={Home} />} />
        <Route
          path="/all-users"
          element={<PrivateRoute element={AllUsersPage} />}
        />

        <Route
          path="/export-data"
          element={<PrivateRoute element={ExportDataPage} />}
        />

        <Route
          path="/my-organization"
          element={<PrivateRoute element={MyOrganization} />}
        />

        <Route
          path="/holiday-manager"
          element={<PrivateRoute element={HolidayManager} />}
        />
        <Route path="/leaves" element={<PrivateRoute element={MyLeaves} />} />
        <Route
          path="/timesheet"
          element={<PrivateRoute element={Timesheet} />}
        />
        <Route
          path="/holidays"
          element={<PrivateRoute element={PublicHolidays} />}
        />

        <Route
          path="/timesheet/:projectId"
          element={<PrivateRoute element={TimesheetSubmitPage} />}
        />

        <Route
          path="/salary-generation"
          element={<PrivateRoute element={SalaryGeneration} />}
        />
      </Routes>
    </Router>
  );
};

export default App;

import React from "react";
import { Route, Navigate } from "react-router-dom";

const PrivateRoute = ({ element: Component, ...rest }) => {
  const authToken = sessionStorage.getItem("authToken");

  // If no authToken, redirect to login page
  if (!authToken) {
    return <Navigate to="/login" />;
  }

  // If the user is authenticated, return the element (protected route)
  return <Component {...rest} />;
};

export default PrivateRoute;

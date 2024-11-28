import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import Navbar from "./Navbar";
import BigCalendar from "../components/BigCalendar";

const PublicHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/public-holidays/`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );

        // Sort holidays by date in ascending order
        const sortedHolidays = response.data.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setHolidays(sortedHolidays);
      } catch (err) {
        setError("Failed to load public holidays. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div
          role="status"
          className="text-lg font-medium text-gray-600 animate-pulse"
        >
          Loading public holidays...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-bold text-lg">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Try refreshing the page or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <BigCalendar />;
    </div>
  );
};

export default PublicHolidays;

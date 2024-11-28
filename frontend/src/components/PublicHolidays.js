// src/components/PublicHolidays.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config"; // Make sure you have your API base URL set
import Navbar from "./Navbar";

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
        setHolidays(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load holidays");
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-xl text-gray-600">Loading holidays...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 font-semibold text-center py-8">{error}</div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-black p-4 border-b-4 border-sky-300 inline-block mb-6">
          Public Holidays
        </h2>
        <ul className="space-y-5">
          {holidays.map((holiday) => (
            <li
              key={holiday.id}
              className="bg-gray-50 border border-gray-300 rounded-lg p-4 hover:bg-sky-50 transition duration-300"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-lg text-gray-900">
                  {holiday.name}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(holiday.date).toLocaleDateString()}
                </div>
              </div>
              {holiday.comment && (
                <div className="text-sm text-gray-600 mt-2 italic">
                  <strong>Comment:</strong> {holiday.comment}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PublicHolidays;

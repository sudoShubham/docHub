import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { API_BASE_URL } from "../config";

// Set up date-fns localizer
const locales = {
  "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const BigCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        // Fetch public holidays
        const holidaysResponse = await axios.get(
          `${API_BASE_URL}/api/users/public-holidays/`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );

        const holidayEvents = holidaysResponse.data.map((holiday) => ({
          title: `Holiday: ${holiday.name}`,
          start: new Date(holiday.date),
          end: new Date(holiday.date),
          allDay: true,
          type: "holiday", // Custom type to differentiate
        }));

        // Fetch leave details
        const leaveResponse = await axios.get(
          `${API_BASE_URL}/api/users/leave/details/`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );

        const leaveEvents = leaveResponse.data.leave_history
          .filter((leave) => leave.status === "Approved") // Only approved leaves
          .map((leave) => ({
            title: `Leave: ${leave.reason}`,
            start: new Date(leave.start_date),
            end: new Date(leave.end_date),
            allDay: true,
            type: "leave", // Custom type to differentiate
          }));

        // Combine events
        setEvents([...holidayEvents, ...leaveEvents]);
        setLoading(false);
      } catch (err) {
        setError("Failed to load calendar events");
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

  // Custom styles for events
  const eventPropGetter = (event) => {
    if (event.type === "holiday") {
      return {
        style: {
          backgroundColor: "#0ea5e9", // Sky blue for holidays
          color: "white",
          borderRadius: "4px",
        },
      };
    }
    if (event.type === "leave") {
      return {
        style: {
          backgroundColor: "#f87171", // Light red for leaves
          color: "white",
          borderRadius: "4px",
        },
      };
    }
    return {};
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-lg font-semibold text-gray-700">
          Loading calendar...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-lg font-bold text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold text-black p-4 border-b-4 border-sky-300 inline-block mb-6">
          Public Holidays and Leaves
        </h2>
        <div className="bg-white shadow-lg rounded-lg p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            eventPropGetter={eventPropGetter}
          />
        </div>
      </div>
    </div>
  );
};

export default BigCalendar;

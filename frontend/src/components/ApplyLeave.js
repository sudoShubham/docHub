import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, addDays } from "date-fns";
import { API_BASE_URL } from "../config";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
  format,
  parse: (date) => new Date(date),
  startOfWeek: (date) => date,
  getDay: (date) => date.getDay(),
  locales,
});

const ApplyLeaveWithCalendar = ({ onLeaveApplied }) => {
  const [events, setEvents] = useState([]); // For visualizing leave events and public holidays
  const [selectedDates, setSelectedDates] = useState(null); // Start and End dates
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch holidays and leave details on component mount
  const fetchHolidaysAndLeaves = async () => {
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
      const holidays = holidaysResponse.data;

      // Fetch leave details (approved, cancelled, rejected, and pending)
      const leaveDetailsResponse = await axios.get(
        `${API_BASE_URL}/api/users/leave/details/`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      const leaveDetails = leaveDetailsResponse.data;

      // Map holidays to events
      const holidayEvents = holidays.map((holiday) => ({
        title: `Public Holiday: ${holiday.name}`,
        start: new Date(holiday.date),
        end: new Date(holiday.date),
        allDay: true,
        type: "holiday",
      }));

      // Map leave history (approved, cancelled, rejected, pending) to events
      const leaveEvents = [
        ...leaveDetails.leave_history.map((leave) => ({
          title: `${leave.status === "Approved" ? "Leave" : leave.status}: ${
            leave.reason
          }`,
          start: new Date(leave.start_date),
          end: new Date(leave.end_date),
          allDay: true,
          type: leave.status.toLowerCase(), // Use status for event type (approved, cancelled, etc.)
        })),
        ...leaveDetails.pending_leaves.map((leave) => ({
          title: `Pending Leave: ${leave.reason}`,
          start: new Date(leave.start_date),
          end: new Date(leave.end_date),
          allDay: true,
          type: "pending", // For pending leaves
        })),
      ];

      // Combine all events (holidays + leave history + pending leaves)
      setEvents([...holidayEvents, ...leaveEvents]);
    } catch (err) {
      console.error("Error fetching holidays and leave details:", err);
    }
  };

  useEffect(() => {
    fetchHolidaysAndLeaves();
  }, []);

  const handleSelectSlot = ({ start, end }) => {
    if (start.toDateString() === end.toDateString()) {
      setSelectedDates({
        start,
        end,
      });
    } else {
      setSelectedDates({
        start,
        end: addDays(end, -1),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedDates || !reason) {
      setError("Please select a date range and provide a reason.");
      return;
    }

    const formattedStartDate = format(selectedDates.start, "yyyy-MM-dd");
    const formattedEndDate = format(selectedDates.end, "yyyy-MM-dd");

    const payload = {
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      reason,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/users/leave/apply/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      setSuccess("Leave applied successfully!");
      onLeaveApplied(response.data);

      // Immediately update the events array with the new leave event
      setEvents((prevEvents) => [
        ...prevEvents,
        {
          title: `Leave: ${reason}`,
          start: selectedDates.start,
          end: selectedDates.end,
          allDay: true,
          type: "leave",
        },
      ]);

      // Re-fetch leave details to ensure the calendar reflects the latest leave status
      fetchHolidaysAndLeaves(); // Re-fetch events after applying leave

      // Clear selected dates and reason after applying the leave
      setSelectedDates(null);
      setReason("");
    } catch (err) {
      console.error("Error applying leave:", err);
      setError("Failed to apply leave. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const eventPropGetter = (event) => {
    switch (event.type) {
      case "holiday":
        return {
          style: {
            backgroundColor: "#f9c74f", // Yellow for public holidays
            color: "black",
            borderRadius: "4px",
          },
        };
      case "approved":
        return {
          style: {
            backgroundColor: "#4CAF50", // Green for approved leaves
            color: "white",
            borderRadius: "4px",
          },
        };
      case "rejected":
        return {
          style: {
            backgroundColor: "#FF6347", // Red for rejected leaves
            color: "white",
            borderRadius: "4px",
          },
        };
      case "cancelled":
        return {
          style: {
            backgroundColor: "#D3D3D3", // Grey for cancelled leaves
            color: "black",
            borderRadius: "4px",
          },
        };
      case "pending":
        return {
          style: {
            backgroundColor: "#FFD700", // Yellow for pending leaves
            color: "black",
            borderRadius: "4px",
          },
        };

      default:
        return {};
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Apply for Leave
      </h3>
      <div className="bg-white shadow-lg rounded-lg p-4 mb-6">
        <Calendar
          localizer={localizer}
          events={events}
          selectable
          onSelectSlot={handleSelectSlot}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          eventPropGetter={eventPropGetter}
        />
      </div>

      {selectedDates && (
        <div className="border border-blue-500 bg-blue-50 text-blue-700 text-sm rounded-md p-4 mb-4">
          {`You have selected leave from ${format(
            selectedDates.start,
            "yyyy-MM-dd"
          )} to ${format(selectedDates.end, "yyyy-MM-dd")}.`}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            rows={3}
            placeholder="Enter the reason for leave"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <button
          type="submit"
          className={`inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none ${
            loading
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Applying..." : "Apply Leave"}
        </button>
      </form>
    </div>
  );
};

export default ApplyLeaveWithCalendar;

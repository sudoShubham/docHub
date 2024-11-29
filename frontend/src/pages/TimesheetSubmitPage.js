import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";
import Navbar from "../components/Navbar";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Localizer for Big Calendar using date-fns
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

const TimesheetSubmitPage = () => {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [timesheetDate, setTimesheetDate] = useState(null);
  const [hoursSpent, setHoursSpent] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [timesheetDetails, setTimesheetDetails] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    // Fetch project and timesheet details
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/projects/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );
        setProject(response.data);
      } catch {
        setError("Failed to fetch project details.");
      }
    };

    const fetchTimesheetDetails = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/timesheet/details/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );
        setTimesheetDetails(response.data);

        const mappedEvents = response.data.map((timesheet) => ({
          title: `Hours: ${timesheet.hours_spent}`,
          start: new Date(timesheet.date),
          end: new Date(timesheet.date),
          allDay: true,
          type: timesheet.is_approved ? "approved" : "pending",
          description: timesheet.description,
        }));
        setCalendarEvents(mappedEvents);
      } catch {
        setError("Failed to fetch timesheet details.");
      }
    };

    fetchProjectDetails();
    fetchTimesheetDetails();
  }, [projectId]);

  const handleSubmitTimesheet = async (e) => {
    e.preventDefault();

    if (!timesheetDate || !hoursSpent || !description) {
      setError("Please fill out all fields.");
      return;
    }

    const payload = {
      project: projectId,
      date: format(timesheetDate, "yyyy-MM-dd"),
      hours_spent: parseFloat(hoursSpent),
      description,
    };

    try {
      await axios.post(`${API_BASE_URL}/api/users/timesheet/submit/`, payload, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });
      setSuccess(true);
      setModalOpen(true);
    } catch {
      setError("Failed to submit timesheet. Please try again.");
    }
  };

  const handleDateSelect = ({ start }) => setTimesheetDate(start);

  if (!project) return <div>Loading Project Details...</div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">
          Submit Timesheet for {project.project_name}
        </h2>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {timesheetDate && (
          <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 mb-4 rounded-md shadow-sm">
            <span className="font-semibold">Selected Date:</span>{" "}
            {format(timesheetDate, "yyyy-MM-dd")}
          </div>
        )}

        <div className="flex flex-wrap gap-8">
          <div className="flex-1 min-w-[300px]">
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Select Date
              </label>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                step={30}
                showMultiDayTimes
                views={["month"]}
                date={timesheetDate}
                onSelectSlot={handleDateSelect}
                onNavigate={setTimesheetDate}
                selectable
                style={{ height: 500, width: "100%" }}
              />
            </div>
          </div>

          <div className="w-[350px] min-w-[300px] max-w-[400px]">
            <form onSubmit={handleSubmitTimesheet}>
              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Hours Spent
                </label>
                <input
                  type="number"
                  value={hoursSpent}
                  onChange={(e) => setHoursSpent(e.target.value)}
                  required
                  className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
              >
                Submit Timesheet
              </button>
            </form>
          </div>
        </div>
      </div>

      {modalOpen && success && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h3 className="text-xl font-semibold text-green-600">Success!</h3>
            <p className="mt-2 text-gray-700">
              Your timesheet has been submitted successfully.
            </p>
            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetSubmitPage;

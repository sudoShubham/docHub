import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import Navbar from "../components/Navbar";

const HolidayManager = () => {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({
    name: "",
    date: "",
    comment: "",
  });
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch holidays on page load
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

  // Handle adding new holiday
  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/users/public-holidays/`,
        newHoliday,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      setHolidays([...holidays, newHoliday]); // Update holiday list
      setNewHoliday({ name: "", date: "", comment: "" }); // Reset form
    } catch (err) {
      setError("Failed to add holiday");
    }
  };

  // Handle updating holiday
  const handleUpdateHoliday = async (holidayId) => {
    try {
      const updatedHoliday = { ...editingHoliday };
      await axios.put(
        `${API_BASE_URL}/api/users/public-holidays/${holidayId}/`,
        updatedHoliday,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      setHolidays(
        holidays.map((holiday) =>
          holiday.id === holidayId ? updatedHoliday : holiday
        )
      );
      setEditingHoliday(null); // Reset editing state
    } catch (err) {
      setError("Failed to update holiday");
    }
  };

  // Handle deleting holiday
  const handleDeleteHoliday = async (holidayId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/users/public-holidays/${holidayId}/`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      setHolidays(holidays.filter((holiday) => holiday.id !== holidayId));
    } catch (err) {
      setError("Failed to delete holiday");
    }
  };

  if (loading) {
    return <div>Loading holidays...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-black p-4 border-b-4 border-sky-300 inline-block mb-6">
          Manage Holidays
        </h2>

        {/* Add Holiday Form */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800">
            Add New Holiday
          </h3>
          <form onSubmit={handleAddHoliday} className="space-y-4 mt-4">
            <input
              type="text"
              className="border p-2 rounded w-full"
              placeholder="Holiday Name"
              value={newHoliday.name}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, name: e.target.value })
              }
              required
            />
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={newHoliday.date}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, date: e.target.value })
              }
              required
            />
            <textarea
              className="border p-2 rounded w-full"
              placeholder="Comment"
              value={newHoliday.comment}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, comment: e.target.value })
              }
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded"
            >
              Add Holiday
            </button>
          </form>
        </div>

        {/* Holidays Table */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            All Holidays
          </h3>
          <table className="min-w-full border-collapse table-auto">
            <thead>
              <tr>
                <th className="border px-4 py-2 text-left">Holiday Name</th>
                <th className="border px-4 py-2 text-left">Date</th>
                <th className="border px-4 py-2 text-left">Comment</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => (
                <tr key={holiday.id}>
                  <td className="border px-4 py-2">{holiday.name}</td>
                  <td className="border px-4 py-2">
                    {new Date(holiday.date).toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-2">
                    {holiday.comment || "N/A"}
                  </td>
                  <td className="border px-4 py-2 flex space-x-2">
                    <button
                      className="text-blue-600"
                      onClick={() => setEditingHoliday(holiday)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDeleteHoliday(holiday.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Holiday Modal */}
        {editingHoliday && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h4 className="text-xl font-semibold">Edit Holiday</h4>
              <input
                type="text"
                className="border p-2 rounded w-full mt-4"
                value={editingHoliday.name}
                onChange={(e) =>
                  setEditingHoliday({ ...editingHoliday, name: e.target.value })
                }
              />
              <input
                type="date"
                className="border p-2 rounded w-full mt-4"
                value={editingHoliday.date}
                onChange={(e) =>
                  setEditingHoliday({ ...editingHoliday, date: e.target.value })
                }
              />
              <textarea
                className="border p-2 rounded w-full mt-4"
                value={editingHoliday.comment}
                onChange={(e) =>
                  setEditingHoliday({
                    ...editingHoliday,
                    comment: e.target.value,
                  })
                }
              />
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => handleUpdateHoliday(editingHoliday.id)}
                  className="bg-green-600 text-white py-2 px-4 rounded"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingHoliday(null)}
                  className="bg-gray-600 text-white py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayManager;

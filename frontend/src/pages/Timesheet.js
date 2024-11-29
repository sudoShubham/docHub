import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { Link } from "react-router-dom";

const Timesheet = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/projects`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        });
        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch project details.");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="p-6 text-center text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="p-6 text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="min-h-screen flex flex-col items-center">
        <div className="p-6 w-full max-w-7xl">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-900">
            Project Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-gradient-to-r from-white via-sky-100 to-sky-200 p-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-semibold text-blue-900">
                    {project.project_name}
                  </h3>
                  <div className="text-sm text-gray-600 mt-2">
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {new Date(project.start_date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>End Date:</strong>{" "}
                      {new Date(project.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Link
                    to={`/timesheet/${project.id}`}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md text-lg font-medium shadow-md hover:bg-blue-700 transition duration-200"
                  >
                    Submit Timesheet
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timesheet;

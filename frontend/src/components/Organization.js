// src/components/Organization.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const Organization = () => {
  const [hierarchy, setHierarchy] = useState(null);
  const [openEmployees, setOpenEmployees] = useState({});

  useEffect(() => {
    const fetchHierarchyData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/reporting-hierarchy/`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );
        setHierarchy(response.data);
      } catch (error) {
        console.error("Error fetching hierarchy data:", error);
      }
    };
    fetchHierarchyData();
  }, []);

  const formatHierarchyData = (data) => {
    const formatNode = (node) => ({
      name: node.name,
      email: node.email || "N/A",
      position: node.position || "N/A",
      children: node.reports?.map((child) => formatNode(child)) || [],
    });

    const upwardHierarchy = data.upward_hierarchy[0];
    const downwardHierarchy = data.downward_hierarchy[0];

    return {
      upward: formatNode(upwardHierarchy),
      downward: formatNode(downwardHierarchy),
    };
  };

  if (!hierarchy) return <div className="text-center text-lg">Loading...</div>;

  const treeData = formatHierarchyData(hierarchy);

  const toggleSubordinates = (email) => {
    setOpenEmployees((prevState) => ({
      ...prevState,
      [email]: !prevState[email],
    }));
  };

  const renderEmployee = (employee) => {
    const isOpen = openEmployees[employee.email];

    return (
      <div
        key={employee.email}
        className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg mb-4 transition-all duration-300 hover:shadow-xl hover:bg-gray-50"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:space-x-4">
          <div className="sm:flex-1">
            <div className="text-lg font-semibold text-gray-800">
              {employee.name}
            </div>
            <div className="text-sm text-gray-600">{employee.position}</div>
            <div className="text-xs text-blue-500">{employee.email}</div>
          </div>
          {employee.children && employee.children.length > 0 && (
            <button
              onClick={() => toggleSubordinates(employee.email)}
              className="mt-2 sm:mt-0 text-blue-500 hover:text-blue-700 transition-all duration-200"
            >
              {isOpen ? "Hide Subordinates" : "Show Subordinates"}
            </button>
          )}
        </div>
        {isOpen && employee.children && (
          <div className="ml-6 mt-4">
            {employee.children.map(renderEmployee)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl font-semibold text-black p-4 border-b-4 border-sky-300 inline-block mb-6">
        My Reporting Line
      </h2>
      <div className="p-4">{renderEmployee(treeData.upward)}</div>
      <h2 className="text-2xl sm:text-3xl font-semibold text-black p-4 border-b-4 border-sky-300 inline-block mb-6">
        Reports To Me
      </h2>
      <div className="p-4">{renderEmployee(treeData.downward)}</div>
    </div>
  );
};

export default Organization;

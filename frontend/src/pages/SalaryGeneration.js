import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

const SalaryGeneration = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [earnings, setEarnings] = useState([
    { name: "Basic", amount: 0 },
    { name: "HRA", amount: 0 },
    { name: "Conveyance Allowance", amount: 0 },
    { name: "Statutory Bonus", amount: 0 },
    { name: "Special or Misc Allowance", amount: 0 },
  ]);
  const [deductions, setDeductions] = useState([
    { name: "Employee Contribution to PF", amount: 0 },
    { name: "Professional Tax", amount: 0 },
  ]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/admin/user-details/`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setUsers(data.user_details))
      .catch((error) => console.error("Error fetching user details:", error));
  }, []);

  const handleUserChange = (e) => {
    const userId = e.target.value;
    const user = users.find((user) => user.details.employee_id === userId);
    setSelectedUser(user);
  };

  const handleEarningsChange = (index, field, value) => {
    const updatedEarnings = [...earnings];
    updatedEarnings[index][field] =
      field === "amount" ? parseFloat(value) || 0 : value;
    setEarnings(updatedEarnings);
  };

  const handleDeductionsChange = (index, field, value) => {
    const updatedDeductions = [...deductions];
    updatedDeductions[index][field] =
      field === "amount" ? parseFloat(value) || 0 : value;
    setDeductions(updatedDeductions);
  };

  const addField = (type) => {
    if (type === "earning") {
      setEarnings([...earnings, { name: "", amount: 0 }]);
    } else {
      setDeductions([...deductions, { name: "", amount: 0 }]);
    }
  };

  const removeField = (type, index) => {
    if (type === "earning") {
      const updatedEarnings = earnings.filter((_, i) => i !== index);
      setEarnings(updatedEarnings);
    } else {
      const updatedDeductions = deductions.filter((_, i) => i !== index);
      setDeductions(updatedDeductions);
    }
  };

  const calculateNetSalary = () => {
    const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = deductions.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    return totalEarnings - totalDeductions;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Salary Slip Generation
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label
              htmlFor="user-select"
              className="block text-gray-700 font-medium mb-2"
            >
              Select Employee
            </label>
            <select
              id="user-select"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleUserChange}
            >
              <option value="">-- Select Employee --</option>
              {users.map((user) => (
                <option
                  key={user.details.employee_id}
                  value={user.details.employee_id}
                >
                  {user.user.first_name} {user.user.last_name} (
                  {user.details.employee_id})
                </option>
              ))}
            </select>
          </div>
          {selectedUser && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Employee Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p>
                  Employee Name:{" "}
                  <span className="font-medium">
                    {selectedUser.user.first_name} {selectedUser.user.last_name}
                  </span>
                </p>
                <p>
                  Employee ID:{" "}
                  <span className="font-medium">
                    {selectedUser.details.employee_id}
                  </span>
                </p>
                <p>
                  Designation:{" "}
                  <span className="font-medium">
                    {selectedUser.details.position || "N/A"}
                  </span>
                </p>
                <p>
                  Department:{" "}
                  <span className="font-medium">
                    {selectedUser.details.job_profile || "N/A"}
                  </span>
                </p>
                <p>
                  Date of Joining:{" "}
                  <span className="font-medium">
                    {selectedUser.details.hire_date || "N/A"}
                  </span>
                </p>
                <p>
                  Work Location:{" "}
                  <span className="font-medium">
                    {selectedUser.details.location || "N/A"}
                  </span>
                </p>
                <p>
                  Bank Name:{" "}
                  <span className="font-medium">
                    {selectedUser.details.bank_account_name || "N/A"}
                  </span>
                </p>
                <p>
                  Bank Account Number:{" "}
                  <span className="font-medium">
                    {selectedUser.details.bank_account_number || "N/A"}
                  </span>
                </p>
                <p>
                  UAN Number:{" "}
                  <span className="font-medium">
                    {selectedUser.details.pf_uan_no || "N/A"}
                  </span>
                </p>
                <p>
                  Aadhar Number:{" "}
                  <span className="font-medium">
                    {selectedUser.details.aadhar_number || "N/A"}
                  </span>
                </p>
                <p>
                  PAN Number:{" "}
                  <span className="font-medium">
                    {selectedUser.details.pan_no || "N/A"}
                  </span>
                </p>
                <p>
                  PF Number:{" "}
                  <span className="font-medium">
                    {selectedUser.details.pf_no || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          )}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Earnings
            </h3>
            {earnings.map((earning, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={earning.name}
                  onChange={(e) =>
                    handleEarningsChange(index, "name", e.target.value)
                  }
                  placeholder="Earning Name"
                  className="flex-1 border border-gray-300 rounded-l-lg p-2"
                />
                <input
                  type="number"
                  value={earning.amount}
                  onChange={(e) =>
                    handleEarningsChange(index, "amount", e.target.value)
                  }
                  placeholder="Amount"
                  className="flex-1 border-t border-b border-gray-300 p-2"
                />
                <button
                  onClick={() => removeField("earning", index)}
                  className="bg-red-500 text-white px-4 py-2 rounded-r-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => addField("earning")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
            >
              Add Earning
            </button>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Deductions
            </h3>
            {deductions.map((deduction, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={deduction.name}
                  onChange={(e) =>
                    handleDeductionsChange(index, "name", e.target.value)
                  }
                  placeholder="Deduction Name"
                  className="flex-1 border border-gray-300 rounded-l-lg p-2"
                />
                <input
                  type="number"
                  value={deduction.amount}
                  onChange={(e) =>
                    handleDeductionsChange(index, "amount", e.target.value)
                  }
                  placeholder="Amount"
                  className="flex-1 border-t border-b border-gray-300 p-2"
                />
                <button
                  onClick={() => removeField("deduction", index)}
                  className="bg-red-500 text-white px-4 py-2 rounded-r-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => addField("deduction")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
            >
              Add Deduction
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800">
              Net Salary: ₹{calculateNetSalary().toFixed(2)}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryGeneration;

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";
import axios from "axios"; // Import axios

const SalaryGeneration = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [ctc, setCtc] = useState(0); // Added state for CTC
  const [earnings, setEarnings] = useState([
    { name: "Basic", amount: 0 },
    { name: "HRA", amount: 0 },
    { name: "Conveyance Allowance", amount: 2000 },
    { name: "Statutory Bonus", amount: 0 },
    { name: "Special or Misc Allowance", amount: 0 },
  ]);
  const [deductions, setDeductions] = useState([
    { name: "Employee Contribution to PF", amount: 1800 },
    { name: "Professional Tax", amount: 200 },
  ]);

  // New state for Salary Date, Salary Month, Paid Days, LOP Days
  const [salaryDate, setSalaryDate] = useState("");
  const [salaryMonth, setSalaryMonth] = useState("");
  const [paidDays, setPaidDays] = useState(0);
  const [lopDays, setLopDays] = useState(0);

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

  useEffect(() => {
    if (salaryMonth) {
      // Calculate the number of days in the selected month using salaryMonth
      const daysInMonth = new Date(
        salaryMonth.substring(0, 4), // Year from salaryMonth (YYYY)
        salaryMonth.substring(5, 7), // Month from salaryMonth (MM)
        0
      ).getDate(); // Get the last day of the month to determine the number of days

      setPaidDays(daysInMonth); // Set default Paid Days to the number of days in the month
    }
  }, [salaryMonth]);

  useEffect(() => {
    if (lopDays > 0) {
      setPaidDays((prevPaidDays) => prevPaidDays - lopDays); // Adjust Paid Days based on LOP Days
    } else {
      setPaidDays(0); // Reset Paid Days if LOP is zero
    }
  }, [lopDays]);

  // const handleExportToPdf = async () => {
  //   try {
  //     const payload = {
  //       userDetails: {
  //         name: `${selectedUser.user.first_name} ${selectedUser.user.last_name}`,
  //         employee_id: selectedUser.details.employee_id,
  //         designation: selectedUser.details.position,
  //         date_of_joining: selectedUser.details.hire_date,
  //         bank_name: selectedUser.details.bank_account_name,
  //         bank_account_number: selectedUser.details.bank_account_number,
  //         uan_number: selectedUser.details.pf_uan_no,
  //         pf_number: selectedUser.details.pf_no,
  //         pan_no: selectedUser.details.pan_no,
  //         aadhar_number: selectedUser.details.aadhar_number,
  //       },
  //       ctc,
  //       salaryDate,
  //       salaryMonth,
  //       paidDays,
  //       lopDays,
  //       earnings,
  //       deductions,
  //       netSalary: calculateNetSalary(),
  //     };

  //     const response = await axios.post(
  //       `${API_BASE_URL}/api/users/generate-pdf/`,
  //       payload,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
  //         },
  //         responseType: "blob", // Important for handling files
  //       }
  //     );

  //     // Create a URL for the PDF file
  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", "salary_slip.pdf"); // Name for the downloaded file
  //     document.body.appendChild(link);
  //     link.click(); // Trigger download
  //     link.remove(); // Clean up
  //   } catch (error) {
  //     console.error("Error exporting PDF:", error);
  //   }
  // };

  const handleExportToHtml = async () => {
    try {
      const payload = {
        userDetails: {
          name: `${selectedUser.user.first_name} ${selectedUser.user.last_name}`,
          employee_id: selectedUser.details.employee_id,
          designation: selectedUser.details.position,
          date_of_joining: selectedUser.details.hire_date,
          bank_name: selectedUser.details.bank_account_name,
          bank_account_number: selectedUser.details.bank_account_number,
          uan_number: selectedUser.details.pf_uan_no,
          pf_number: selectedUser.details.pf_no,
          pan_no: selectedUser.details.pan_no,
          aadhar_number: selectedUser.details.aadhar_number,
        },
        ctc,
        salaryDate,
        salaryMonth,
        paidDays,
        lopDays,
        earnings,
        deductions,
        netSalary: calculateNetSalary(),
      };

      // Make a POST request to your API to generate the HTML salary slip
      const response = await axios.post(
        `${API_BASE_URL}/api/users/generate-salary-slip/`, // Replace with your actual API endpoint
        payload,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
          responseType: "text", // We expect HTML in response
        }
      );

      // Open the generated HTML content in a new window
      const newWindow = window.open();
      newWindow.document.write(response.data); // Write the HTML content to the new window
      newWindow.document.close(); // Ensure the document is fully loaded

      // Optionally, you could trigger the print dialog automatically
      newWindow.print(); // Automatically opens the print dialog
    } catch (error) {
      console.error("Error exporting HTML:", error);
    }
  };

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

    // Calculate the number of days in the selected month using salaryMonth
    const daysInMonth = new Date(
      salaryMonth.substring(0, 4), // Year from salaryMonth (YYYY)
      salaryMonth.substring(5, 7), // Month from salaryMonth (MM)
      0
    ).getDate(); // Get the last day of the month to determine the number of days

    // Calculate loss of pay (LOP) if LOP days are greater than 0
    const lopAmount = lopDays > 0 ? (lopDays / daysInMonth) * totalEarnings : 0;

    // Return the final net salary after deductions and LOP
    return totalEarnings - totalDeductions - lopAmount;
  };

  const handleCtcChange = (value) => {
    const parsedCtc = parseFloat(value) || 0;
    setCtc(parsedCtc);

    // Calculate monthly values and round them to 2 decimal places
    const basic = ((parsedCtc * 0.4) / 12).toFixed(2); // 40% of CTC, calculate monthly
    const hra = (parseFloat(basic) * 0.5).toFixed(2); // 50% of Basic
    const conveyanceAllowance = 2000; // Fixed amount
    const statutoryBonus = (parseFloat(basic) * 0.0833).toFixed(2); // 8.33% of Basic
    const employerPf = 1800; // Fixed Employer Contribution to PF
    const gratuity = (parseFloat(basic) * 0.048).toFixed(2); // 4.8% of Basic

    // Calculate special allowance as the remaining part of CTC after subtracting all other components
    const monthlyCTC = (parsedCtc / 12).toFixed(2);
    const specialAllowance = (
      parseFloat(monthlyCTC) -
      (parseFloat(basic) +
        parseFloat(hra) +
        conveyanceAllowance +
        parseFloat(statutoryBonus) +
        employerPf +
        parseFloat(gratuity))
    ).toFixed(2);

    // Create updated earnings array with rounded values
    const updatedEarnings = [
      { name: "Basic", amount: parseFloat(basic) },
      { name: "HRA", amount: parseFloat(hra) },
      { name: "Conveyance Allowance", amount: conveyanceAllowance },
      { name: "Statutory Bonus", amount: parseFloat(statutoryBonus) },
      {
        name: "Special or Misc Allowance",
        amount: parseFloat(specialAllowance),
      },
    ];

    setEarnings(updatedEarnings);
  };
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-sky-400 inline-block">
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
              {/* Employee Details Section */}
              {/* Same as before */}
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
                  Date of Joining:{" "}
                  <span className="font-medium">
                    {selectedUser.details.hire_date || "N/A"}
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
            <label
              htmlFor="ctc-input"
              className="block text-gray-700 font-medium mb-2"
            >
              Enter CTC
            </label>
            <input
              type="number"
              id="ctc-input"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={ctc}
              onChange={(e) => handleCtcChange(e.target.value)}
              placeholder="Enter CTC"
            />
          </div>
          {/* Salary Date, Salary Month, Paid Days, LOP Days Inputs */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="salary-date"
                className="block text-gray-700 font-medium mb-2"
              >
                Salary Date
              </label>
              <input
                type="date"
                id="salary-date"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={salaryDate}
                onChange={(e) => setSalaryDate(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="salary-month"
                className="block text-gray-700 font-medium mb-2"
              >
                Salary Month
              </label>
              <input
                type="month"
                id="salary-month"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={salaryMonth}
                onChange={(e) => setSalaryMonth(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="paid-days"
                className="block text-gray-700 font-medium mb-2"
              >
                Paid Days
              </label>
              <input
                type="number"
                id="paid-days"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={paidDays}
                onChange={(e) => setPaidDays(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="lop-days"
                className="block text-gray-700 font-medium mb-2"
              >
                LOP Days
              </label>
              <input
                type="number"
                id="lop-days"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={lopDays}
                onChange={(e) => setLopDays(e.target.value)}
              />
            </div>
          </div>

          {/* Earnings and Deductions in two columns */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Earnings Column */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Earnings
                <button
                  className="ml-4 px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                  onClick={() => addField("earning")}
                >
                  Add Earning
                </button>
              </h3>
              {earnings.map((earning, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="w-3/4 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                    value={earning.name}
                    onChange={(e) =>
                      handleEarningsChange(index, "name", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    className="w-1/4 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                    value={earning.amount}
                    onChange={(e) =>
                      handleEarningsChange(index, "amount", e.target.value)
                    }
                  />
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                    onClick={() => removeField("earning", index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Deductions Column */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Deductions
                <button
                  className="ml-4 px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                  onClick={() => addField("deduction")}
                >
                  Add Deduction
                </button>
              </h3>
              {deductions.map((deduction, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="w-3/4 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                    value={deduction.name}
                    onChange={(e) =>
                      handleDeductionsChange(index, "name", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    className="w-1/4 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                    value={deduction.amount}
                    onChange={(e) =>
                      handleDeductionsChange(index, "amount", e.target.value)
                    }
                  />
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                    onClick={() => removeField("deduction", index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Net Monthly Salary: ₹{calculateNetSalary().toFixed(2)}
            </h3>
          </div>
          <div className="text-right">
            <button
              onClick={handleExportToHtml}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Export to PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryGeneration;

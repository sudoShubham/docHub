import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const SalaryGeneration = () => {
  const [ctc, setCtc] = useState("");
  const [basicYearly, setBasicYearly] = useState(0);
  const [hraYearly, setHraYearly] = useState(0);
  const [conveyanceAllowanceYearly, setConveyanceAllowanceYearly] =
    useState(24000); // Fixed
  const [statutoryBonusYearly, setStatutoryBonusYearly] = useState(0);
  const [specialAllowanceYearly, setSpecialAllowanceYearly] = useState(0);
  const [employerPfYearly, setEmployerPfYearly] = useState(21600); // Fixed
  const [gratuityYearly, setGratuityYearly] = useState(0);
  const [totalGrossYearly, setTotalGrossYearly] = useState(0);
  const [totalCtcYearly, setTotalCtcYearly] = useState(0);
  const [netTakeHomeYearly, setNetTakeHomeYearly] = useState(0);

  const employeePfYearly = 21600; // Fixed value
  const professionalTaxYearly = 2400; // Fixed value

  // Handles CTC input change
  const handleCtcChange = (event) => {
    const enteredCtc = parseFloat(event.target.value) || 0;
    setCtc(enteredCtc);

    // Calculate components
    const basic = (enteredCtc * 40) / 100; // 40% of CTC
    const hra = (basic * 50) / 100; // 50% of Basic
    const statutoryBonus = (basic * 8.33) / 100; // 8.33% of Basic
    const gratuity = (basic * 4.8) / 100; // 4.8% of Basic
    const totalFixedYearly =
      basic + hra + conveyanceAllowanceYearly + statutoryBonus;
    const specialAllowance =
      enteredCtc - (totalFixedYearly + employerPfYearly + gratuity);

    // Set values
    setBasicYearly(basic);
    setHraYearly(hra);
    setStatutoryBonusYearly(statutoryBonus);
    setGratuityYearly(gratuity);
    setSpecialAllowanceYearly(specialAllowance);

    // Calculate totals
    const grossCompensation =
      basic +
      hra +
      conveyanceAllowanceYearly +
      statutoryBonus +
      specialAllowance;
    setTotalGrossYearly(grossCompensation);
    setTotalCtcYearly(enteredCtc);

    // Calculate net take-home salary
    const netTakeHome =
      grossCompensation - (employeePfYearly + professionalTaxYearly);
    setNetTakeHomeYearly(netTakeHome);
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto mt-10">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Generate Salary Slip
          </h2>
          <div className="form-group mt-6">
            <label htmlFor="ctcInput" className="text-lg font-medium">
              Enter CTC:
            </label>
            <input
              type="number"
              id="ctcInput"
              className="form-control mt-2 p-3 border rounded-md w-full"
              placeholder="Enter CTC amount"
              value={ctc}
              onChange={handleCtcChange}
            />
          </div>

          {ctc > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800">
                Salary Breakdown
              </h3>
              <div className="overflow-x-auto mt-5 bg-white shadow-lg rounded-lg">
                <table className="table-auto w-full text-sm">
                  <thead className="bg-gray-200 text-gray-600">
                    <tr>
                      <th className="px-6 py-4 text-left">Sr. No.</th>
                      <th className="px-6 py-4 text-left">Description</th>
                      <th className="px-6 py-4 text-left">Monthly</th>
                      <th className="px-6 py-4 text-left">Yearly</th>
                      <th className="px-6 py-4 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="px-6 py-4">1</td>
                      <td className="px-6 py-4">Basic</td>
                      <td className="px-6 py-4">
                        ₹{(basicYearly / 12).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">₹{basicYearly.toFixed(2)}</td>
                      <td className="px-6 py-4">40% of CTC</td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-6 py-4">2</td>
                      <td className="px-6 py-4">HRA</td>
                      <td className="px-6 py-4">
                        ₹{(hraYearly / 12).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">₹{hraYearly.toFixed(2)}</td>
                      <td className="px-6 py-4">50% of Basic</td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-6 py-4">3</td>
                      <td className="px-6 py-4">Conveyance Allowance</td>
                      <td className="px-6 py-4">
                        ₹{(conveyanceAllowanceYearly / 12).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        ₹{conveyanceAllowanceYearly.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">Fixed</td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-6 py-4">4</td>
                      <td className="px-6 py-4">Statutory Bonus</td>
                      <td className="px-6 py-4">
                        ₹{(statutoryBonusYearly / 12).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        ₹{statutoryBonusYearly.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">8.33% of Basic</td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-6 py-4">5</td>
                      <td className="px-6 py-4">Special Allowance</td>
                      <td className="px-6 py-4">
                        ₹{(specialAllowanceYearly / 12).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        ₹{specialAllowanceYearly.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">Remaining Amount</td>
                    </tr>
                    <tr className="border-t border-gray-100 bg-gray-50">
                      <td
                        colSpan="2"
                        className="px-6 py-4 font-semibold text-gray-800"
                      >
                        Total Gross Compensation
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        ₹{(totalGrossYearly / 12).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        ₹{totalGrossYearly.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mt-8">
                Deductions
              </h3>
              <div className="overflow-x-auto mt-5 bg-white shadow-lg rounded-lg">
                <table className="table-auto w-full text-sm">
                  <thead className="bg-gray-200 text-gray-600">
                    <tr>
                      <th className="px-6 py-4 text-left">Sr. No.</th>
                      <th className="px-6 py-4 text-left">Description</th>
                      <th className="px-6 py-4 text-left">Monthly</th>
                      <th className="px-6 py-4 text-left">Yearly</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="px-6 py-4">1</td>
                      <td className="px-6 py-4">Employee PF</td>
                      <td className="px-6 py-4">
                        ₹{(employeePfYearly / 12).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        ₹{employeePfYearly.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-6 py-4">2</td>
                      <td className="px-6 py-4">Professional Tax</td>
                      <td className="px-6 py-4">
                        ₹{(professionalTaxYearly / 12).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        ₹{professionalTaxYearly.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-100 bg-gray-50">
                      <td
                        colSpan="2"
                        className="px-6 py-4 font-semibold text-gray-800"
                      >
                        Net Take Home
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        ₹{(netTakeHomeYearly / 12).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        ₹{netTakeHomeYearly.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryGeneration;

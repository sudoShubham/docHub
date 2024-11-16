// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";
// import CompanyLogo from "../images/Waynautic.png";
// import { API_BASE_URL } from "../config";

// const Login = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${API_BASE_URL}/api/users/login/`, {
//         email: username, // assuming email is used as username
//         password: password,
//       });
//       const { access_token, user } = response.data;
//       // console.log(access_token, user);
//       sessionStorage.setItem("authToken", access_token);
//       sessionStorage.setItem("userDetails", JSON.stringify(user));
//       navigate("/dashboard");
//     } catch (error) {
//       console.error("Login failed", error);
//       alert("Invalid credentials");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-green-200 p-4">
//       <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md">
//         {/* Center the logo */}
//         <div className="flex justify-center mb-6">
//           <Link
//             to="https://waynautic.com/"
//             className="items-center space-x-2 ml-12"
//             target="_blank"
//           >
//             <img src={CompanyLogo} alt="Company Logo" className="h-10" />
//           </Link>
//         </div>

//         <p className="text-center text-gray-500 mb-8">
//           Please login to your account
//         </p>
//         <form onSubmit={handleLogin} className="space-y-6">
//           <div className="mb-4">
//             <label
//               htmlFor="username"
//               className="block text-sm font-medium text-gray-700 mb-2"
//             >
//               Username
//             </label>
//             <input
//               type="text"
//               id="username"
//               className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
//               placeholder="Enter your username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//             />
//           </div>
//           <div className="mb-6">
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-gray-700 mb-2"
//             >
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
//           >
//             Login
//           </button>
//         </form>
//         <div className="mt-6 text-center">
//           <p className="text-sm text-gray-500">
//             Forgot your password?{" "}
//             <Link
//               to="/forgot-password"
//               className="text-blue-500 hover:text-blue-700"
//             >
//               Click here
//             </Link>
//           </p>
//         </div>
//         <div className="mt-4 text-center">
//           <p className="text-sm text-gray-500">
//             Don’t have an account?{" "}
//             <Link
//               to="/signup"
//               className="text-blue-500 hover:text-blue-700 font-semibold"
//             >
//               Sign Up
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import CompanyLogo from "../images/Waynautic.png";
import { API_BASE_URL } from "../config";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login/`, {
        email: username,
        password: password,
      });
      const { access_token, user } = response.data;
      sessionStorage.setItem("authToken", access_token);
      sessionStorage.setItem("userDetails", JSON.stringify(user));
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-green-200 p-4">
      <div className="bg-white p-6 md:p-10 rounded-lg shadow-2xl w-full max-w-md">
        {/* Centered logo with responsive styling */}
        <div className="flex justify-center mb-6">
          <Link
            to="https://waynautic.com/"
            target="_blank"
            className="flex items-center"
          >
            <img
              src={CompanyLogo}
              alt="Company Logo"
              className="h-10 md:h-12 max-w-full object-contain"
            />
          </Link>
        </div>

        <p className="text-center text-gray-500 mb-8 text-sm md:text-base">
          Please login to your account
        </p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Forgot your password?{" "}
            <Link
              to="/forgot-password"
              className="text-blue-500 hover:text-blue-700"
            >
              Click here
            </Link>
          </p>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

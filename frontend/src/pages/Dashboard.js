// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Navbar from "../components/Navbar";
// import { XCircleIcon } from "@heroicons/react/20/solid";
// import { PencilIcon, CheckIcon } from "@heroicons/react/20/solid"; // Import icons for edit and save
// import { useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config";

// const Dashboard = () => {
//   const [files, setFiles] = useState({});
//   const [fieldNames, setFieldNames] = useState(["Aadhar Card", "PAN Card"]);
//   const [editingFieldIndex, setEditingFieldIndex] = useState(null);
//   const [newFieldName, setNewFieldName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [userDetails, setUserDetails] = useState({ name: "", email: "" });
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedUser = sessionStorage.getItem("userDetails");
//     if (storedUser) {
//       const user = JSON.parse(storedUser);
//       setUserDetails({
//         name: `${user.first_name}`,
//         email: user.email,
//       });
//     }
//   }, []);

//   const handleFileChange = (e, index) => {
//     const selectedFiles = Array.from(e.target.files);
//     setFiles((prevFiles) => ({
//       ...prevFiles,
//       [fieldNames[index]]: [
//         ...(prevFiles[fieldNames[index]] || []),
//         ...selectedFiles,
//       ],
//     }));
//   };

//   const handleFileUpload = async (e) => {
//     e.preventDefault();
//     if (Object.values(files).every((fileArray) => fileArray.length === 0)) {
//       alert("Please select at least one document to upload.");
//       return;
//     }

//     setLoading(true);
//     const formData = new FormData();

//     // Append all selected files to the formData with new names
//     Object.keys(files).forEach((key) => {
//       files[key].forEach((file, index) => {
//         // Rename file to match input field name
//         const renamedFile = new File(
//           [file],
//           `${key}${file.name.substring(file.name.lastIndexOf("."))}`
//         );
//         formData.append(key, renamedFile);
//       });
//     });

//     // Append user details for form submission
//     formData.append("name", userDetails.name);
//     formData.append("email", userDetails.email);

//     try {
//       const authToken = sessionStorage.getItem("authToken");
//       const response = await axios.post(
//         `${API_BASE_URL}/api/users/upload-documents/`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       // After successful upload, navigate to the documents page
//       setLoading(false);
//       navigate("/my-documents");
//     } catch (error) {
//       console.error("Error uploading documents:", error);
//       alert("Error uploading documents. Please try again.");
//       setLoading(false);
//     }
//   };

//   const handleRemoveFile = (fileType, fileName) => {
//     setFiles((prevFiles) => ({
//       ...prevFiles,
//       [fileType]: prevFiles[fileType].filter((file) => file.name !== fileName),
//     }));
//   };

//   const handleAddField = () => {
//     setFieldNames([...fieldNames, "New Document"]);
//   };

//   const handleEditFieldName = (index) => {
//     setEditingFieldIndex(index);
//     setNewFieldName(fieldNames[index]);
//   };

//   const handleSaveFieldName = (index) => {
//     const updatedFieldNames = [...fieldNames];
//     updatedFieldNames[index] = newFieldName;
//     setFieldNames(updatedFieldNames);
//     setEditingFieldIndex(null);
//   };

//   return (
//     <div className="min-h-screen bg-blue-10">
//       <Navbar />
//       <div className="container mx-auto pt-20 px-6 sm:px-12 lg:px-32">
//         <div className="bg-white p-10 rounded-2xl max-w-3xl mx-auto">
//           <h2 className="text-3xl font-semibold text-center text-gray-800 mb-4">
//             Welcome {userDetails.name}!
//           </h2>
//           <p className="text-center text-gray-500 mb-6">
//             Please upload your important documents to complete your profile.
//           </p>

//           <form onSubmit={handleFileUpload} className="space-y-6">
//             {loading ? (
//               <div className="text-center">
//                 <p className="text-lg text-gray-600">Uploading your files...</p>
//                 <div className="loader border-t-4 border-blue-500 w-10 h-10 rounded-full animate-spin mt-4 mx-auto"></div>
//               </div>
//             ) : (
//               <>
//                 {fieldNames.map((fieldName, index) => (
//                   <div key={index} className="space-y-2">
//                     <div className="flex justify-between items-center">
//                       {editingFieldIndex === index ? (
//                         <>
//                           <input
//                             type="text"
//                             value={newFieldName}
//                             onChange={(e) => setNewFieldName(e.target.value)}
//                             className="py-2 px-3 border border-gray-300 rounded-lg shadow-sm"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => handleSaveFieldName(index)}
//                             className="text-green-600 hover:text-green-800 ml-2"
//                           >
//                             <CheckIcon className="w-5 h-5" />
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           <label className="block text-sm font-medium text-gray-700">
//                             {fieldName}
//                           </label>
//                           <button
//                             type="button"
//                             onClick={() => handleEditFieldName(index)}
//                             className="text-blue-600 hover:text-blue-800 ml-2"
//                           >
//                             <PencilIcon className="w-5 h-5" />
//                           </button>
//                         </>
//                       )}
//                     </div>
//                     <input
//                       type="file"
//                       onChange={(e) => handleFileChange(e, index)}
//                       className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       multiple
//                     />
//                     {files[fieldName] && files[fieldName].length > 0 && (
//                       <div className="mt-2 space-y-2">
//                         {files[fieldName].map((file) => (
//                           <div
//                             key={file.name}
//                             className="flex justify-between items-center"
//                           >
//                             <span className="text-gray-600">{file.name}</span>
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 handleRemoveFile(fieldName, file.name)
//                               }
//                               className="text-red-600 hover:text-red-800"
//                             >
//                               <XCircleIcon className="w-5 h-5" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={handleAddField}
//                   className="text-blue-600 hover:text-blue-800"
//                 >
//                   + Add Another Document
//                 </button>
//               </>
//             )}
//             <button
//               type="submit"
//               className="w-full py-3 bg-sky-500 text-white text-lg font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               disabled={loading}
//             >
//               {loading ? "Uploading..." : "Upload Documents"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { PencilIcon, CheckIcon } from "@heroicons/react/20/solid"; // Import icons for edit and save
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const Dashboard = () => {
  const [files, setFiles] = useState({});
  const [fieldNames, setFieldNames] = useState(["Aadhar Card", "PAN Card"]);
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [newFieldName, setNewFieldName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: "", email: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("userDetails");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserDetails({
        name: `${user.first_name}`,
        email: user.email,
      });
    }
  }, []);

  const handleFileChange = (e, index) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fieldNames[index]]: [
        ...(prevFiles[fieldNames[index]] || []),
        ...selectedFiles,
      ],
    }));
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (Object.values(files).every((fileArray) => fileArray.length === 0)) {
      alert("Please select at least one document to upload.");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // Append all selected files to the formData with new names
    Object.keys(files).forEach((key) => {
      files[key].forEach((file, index) => {
        // Rename file to match input field name
        const renamedFile = new File(
          [file],
          `${key}${file.name.substring(file.name.lastIndexOf("."))}`
        );
        formData.append(key, renamedFile);
      });
    });

    // Append user details for form submission
    formData.append("name", userDetails.name);
    formData.append("email", userDetails.email);

    try {
      const authToken = sessionStorage.getItem("authToken");
      const response = await axios.post(
        `${API_BASE_URL}/api/users/upload-documents/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // After successful upload, navigate to the documents page
      setLoading(false);
      navigate("/my-documents");
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert("Error uploading documents. Please try again.");
      setLoading(false);
    }
  };

  const handleRemoveFile = (fileType, fileName) => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fileType]: prevFiles[fileType].filter((file) => file.name !== fileName),
    }));
  };

  const handleRemoveField = (index) => {
    const updatedFieldNames = fieldNames.filter((_, i) => i !== index);
    const updatedFiles = { ...files };
    delete updatedFiles[fieldNames[index]];

    setFieldNames(updatedFieldNames);
    setFiles(updatedFiles);
  };

  const handleAddField = () => {
    setFieldNames([...fieldNames, "New Document"]);
  };

  const handleEditFieldName = (index) => {
    setEditingFieldIndex(index);
    setNewFieldName(fieldNames[index]);
  };

  const handleSaveFieldName = (index) => {
    const updatedFieldNames = [...fieldNames];
    updatedFieldNames[index] = newFieldName;
    setFieldNames(updatedFieldNames);
    setEditingFieldIndex(null);
  };

  return (
    <div className="min-h-screen bg-blue-10">
      <Navbar />
      <div className="container mx-auto pt-20 px-6 sm:px-12 lg:px-32">
        <div className="bg-white p-10 rounded-2xl max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-4">
            Welcome {userDetails.name}!
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Please upload your important documents to complete your profile.
          </p>

          <form onSubmit={handleFileUpload} className="space-y-6">
            {loading ? (
              <div className="text-center">
                <p className="text-lg text-gray-600">Uploading your files...</p>
                <div className="loader border-t-4 border-blue-500 w-10 h-10 rounded-full animate-spin mt-4 mx-auto"></div>
              </div>
            ) : (
              <>
                {fieldNames.map((fieldName, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      {editingFieldIndex === index ? (
                        <>
                          <input
                            type="text"
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)}
                            className="py-2 px-3 border border-gray-300 rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveFieldName(index)}
                            className="text-green-600 hover:text-green-800 ml-2"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <label className="block text-sm font-medium text-gray-700">
                              {fieldName}
                            </label>
                            <button
                              type="button"
                              onClick={() => handleEditFieldName(index)}
                              className="text-blue-600 hover:text-blue-800 ml-2"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                          </div>
                          {/* Cross Button to Remove Field */}
                          <button
                            type="button"
                            onClick={() => handleRemoveField(index)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, index)}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      multiple
                    />
                    {files[fieldName] && files[fieldName].length > 0 && (
                      <div className="mt-2 space-y-2">
                        {files[fieldName].map((file) => (
                          <div
                            key={file.name}
                            className="flex justify-between items-center"
                          >
                            <span className="text-gray-600">{file.name}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveFile(fieldName, file.name)
                              }
                              className="text-red-600 hover:text-red-800"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddField}
                  className="text-blue-600 hover:text-blue-800"
                >
                  + Add Another Document
                </button>
              </>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-sky-500 text-white text-lg font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Documents"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/Loader/Loader";
import { FaMapMarkerAlt, FaBook, FaUser, FaUsers, FaEdit } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
export default function Page({ params }) {
  const { id } = params;
  const [branch, setBranch] = useState(null);
  const [branchid, setBranchid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [allCourses, setAllCourses] = useState([]);

  const [branchData, setBranchData] = useState({
    courses: [], // Initialize with an empty array for courses
  });

  const router = useRouter();
  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(`/api/branch/find-single/${id}`);
        setBranch(response.data.branch);
        setBranchid(response.data.branch._id)
        setBranchData(response.data.branch);
      } catch (error) {
        console.error("Error fetching branch data:", error);
        setError("Failed to fetch branch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBranchData();
  }, [id]);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {


        const courseResponse = await axios.get("/api/course/fetchall/courses");
        setAllCourses(courseResponse.data.fetch || []);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested properties for location and contactInfo
    setBranchData((prevData) => {
      const newData = { ...prevData };
      const keys = name.split(".");

      if (keys.length === 1) {
        newData[keys[0]] = value;
      } else {
        newData[keys[0]] = {
          ...newData[keys[0]],
          [keys[1]]: value,
        };
      }

      return newData;
    });
  };

  const handleSaveChanges = async () => {
    try {
      await axios.patch("/api/branch/update/", {
        id: branch._id,
        ...branchData,
      });
      setBranch(branchData);
      toast.success("Branch updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating branch data:", error);
      setError("Failed to update branch data.");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setBranchData(branch);
  };

  const handledelete = async () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this branch?");

    if (isConfirmed) {
      try {
        await axios.delete(`/api/branch/delete/${branchid}`);
        router.push("/main/page/branch");
        toast.success("Branch deleted successfully!");
      } catch (error) {
        console.error('Error deleting branch:', error);
        toast.error("Failed to delete the branch.");
      }
    }
  };


  // Handle adding/removing courses
  const addCourse = () => {
    setBranchData((prevData) => ({
      ...prevData,
      courses: [...prevData.courses, ""],
    }));
  };

  const removeCourse = (index) => {
    setBranchData((prevData) => ({
      ...prevData,
      courses: prevData.courses.filter((_, i) => i !== index),
    }));
  };

  const handleCourseChange = (index, value) => {
    setBranchData((prevData) => {
      const updatedCourses = [...prevData.courses];
      updatedCourses[index] = value;
      return { ...prevData, courses: updatedCourses };
    });
  };

  return (
    <div className="container lg:w-[90%] mx-auto py-5">
      <Toaster />
      {loading ? (
        <div className="flex justify-center items-center h-[300px]">
          <Loader />
        </div>
      ) : error ? (
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">{error}</p>
        </div>
      ) : branch ? (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-[#6cb049] text-white p-4 flex justify-between w-full">
            <h1 className="text-3xl font-bold">{branch.branch_name}</h1>
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="ml-4 py-2 px-4 bg-[#6cb049] text-white rounded flex items-center"
              >
                <FaEdit className="mr-2" /> Edit
              </button>
            )}
          </div>
          <div className="p-6 space-y-4">
            {isEditing ? (
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700">Branch Name</label>
                  <input
                    type="text"
                    name="branch_name"
                    disabled
                    value={branchData.branch_name || ""}
                    onChange={handleInputChange}
                    className="block w-full px-2 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700">Courses</label>
                  {branchData.courses.map((course, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <select
                        value={branchData.courses[index]}
                        onChange={(e) => handleCourseChange(index, e.target.value)}
                        className="block w-full px-2 py-2 mt-1 text-gray-500 bg-white border border-gray-200 rounded-md"
                      >
                        <option value="">Select a Course</option>
                        {allCourses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.course_name}
                          </option>
                        ))}
                      </select>

                      {branchData.courses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCourse(index)}
                          className="text-red-500"
                        >
                          &#x2715;
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCourse}
                    className="mt-2 text-[#6cb049] underline"
                  >
                    Add More Courses
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700">Street</label>
                  <input
                    type="text"
                    name="location.street"
                    value={branchData.location?.street || ""}
                    onChange={handleInputChange}
                    className="block w-full px-2 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">City</label>
                  <input
                    type="text"
                    name="location.city"
                    value={branchData.location?.city || ""}
                    onChange={handleInputChange}
                    className="block w-full px-2 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">State</label>
                  <input
                    type="text"
                    name="location.state"
                    value={branchData.location?.state || ""}
                    onChange={handleInputChange}
                    className="block w-full px-2 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Zip Code</label>
                  <input
                    type="text"
                    name="location.zipCode"
                    value={branchData.location?.zipCode || ""}
                    onChange={handleInputChange}
                    className="block w-full px-2 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="contactInfo.phoneNumber"
                    value={branchData.contactInfo?.phoneNumber || ""}
                    onChange={handleInputChange}
                    className="block w-full px-2 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Email</label>
                  <input
                    type="text"
                    name="contactInfo.email"
                    value={branchData.contactInfo?.email || ""}
                    onChange={handleInputChange}
                    className="block w-full px-2 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                  />
                </div>
                <div className=" flex flex-col gap-2 md:flex-row justify-between">
                  <div>
                    <button
                      onClick={handleSaveChanges}
                      className="mr-4 py-2 px-4 bg-[#6cb049] text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="py-2 px-4 bg-gray-500 text-white rounded"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className=" flex justify-end">
                    <button
                      onClick={handledelete}
                      className="py-2 px-4 bg-red-600 text-white rounded"
                    >
                      Delete This Branch
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2 text-gray-700 border-b py-2">
                  <FaMapMarkerAlt className="text-xl text-[#6cb049]" />
                  <p>
                    {branch.location.street}, {branch.location.city},{" "}
                    {branch.location.state}, {branch.location.zipCode}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 border-b py-2">
                  <FaBook className="text-xl text-[#6cb049]" />


                  <p>
                    {branch.courses.map(courseId => {
                      const course = allCourses.find(course => course._id === courseId);
                      return course ? course.course_name : "Unknown Course";
                    }).join(" , ")}
                  </p>




                </div>
                <div className="flex items-center space-x-2 text-gray-700 border-b py-2">
                  <FaUser className="text-xl text-[#6cb049]" />
                  <p>{branch.student_count} Student</p>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 border-b py-2">
                  <FaUsers className="text-xl text-[#6cb049]" />
                  <p>
                    {branch.staff_count} employee(s) working at this branch
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-700">
          <p className="text-lg font-semibold">Branch not found.</p>
        </div>
      )}
    </div>
  );
}

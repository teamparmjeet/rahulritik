"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import toast, { Toaster } from "react-hot-toast";
import { CirclePlus } from "lucide-react";

export default function Page() {
  const [allCourses, setAllCourses] = useState([]);

  const [formData, setFormData] = useState({
    branch_name: "",
    location: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    contactInfo: {
      phoneNumber: "",
      email: "",
    },
    courses: [""],
    student_count: "0",
    staff_count: "0",
    defaultdata: "branch",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);



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




  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("location.")) {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [name.split(".")[1]]: value,
        },
      });
    } else if (name.includes("contactInfo.")) {
      setFormData({
        ...formData,
        contactInfo: {
          ...formData.contactInfo,
          [name.split(".")[1]]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };


  const handleCourseChange = (index, value) => {
    const updatedCourses = [...formData.courses];
    updatedCourses[index] = value;
    setFormData({ ...formData, courses: updatedCourses });
  };

  const addCourse = () => {
    setFormData({ ...formData, courses: [...formData.courses, ""] });
  };
  const removeCourse = (index) => {
    const updatedCourses = formData.courses.filter((_, i) => i !== index);
    setFormData({ ...formData, courses: updatedCourses });
  };


  useEffect(() => {
    const isFormFilled =
      formData.branch_name &&
      formData.location.street &&
      formData.location.city &&
      formData.location.state &&
      formData.location.zipCode &&
      formData.contactInfo.phoneNumber &&
      formData.contactInfo.email &&
      formData.courses.every((course) => course.trim() !== "");

    setIsFormValid(isFormFilled);
  }, [formData]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {

      const response = await axios.post("/api/branch/create", formData);
      if (response.status === 200) {
        setSuccess("Branch successfully created!");
        toast.success("Branch successfully created!")
        setFormData({
          branch_name: "",
          location: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
          },
          contactInfo: {
            phoneNumber: "",
            email: "",
          },
          courses: [""],
          student_count: "0",
          staff_count: "0",
          defaultdata: "branch",
        });
      }
    } catch (err) {
      setError("Failed to create branch. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container lg:w-[90%] mx-auto py-5">
      <Toaster />
      <div className="bg-white shadow-lg   overflow-hidden border border-gray-200">
        <div className="bg-[#29234b] text-white px-7 py-3 flex justify-between w-full">
          <h1 className="text-lg font-bold">Add New Branch</h1>
        </div>


        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">{success}</div>}

        <form onSubmit={handleSubmit} className="px-5 py-3 space-y-3">
          {/* Branch Name */}
          <div className="grid grid-cols-12 gap-4">
            <div className="sm:col-span-6 col-span-12">
              <label htmlFor="branch_name" className="block text-[12px] text-gray-700">
                Branch Name
              </label>
              <input
                type="text"
                name="branch_name"
                placeholder="Enter Branch Name"
                value={formData.branch_name}
                onChange={handleChange}
                className="block w-full px-2 py-2 text-gray-500 bg-white border border-gray-200  placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
              />
            </div>
            <div className="sm:col-span-6 col-span-12">
              <label className="block text-[12px] text-gray-700">Street</label>
              <input
                type="text"
                name="location.street"
                value={formData.location.street}
                placeholder="Street"
                onChange={handleChange}
                className="block w-full px-2 py-2 text-gray-500 bg-white border border-gray-200   placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
              />
            </div>


            <div className="sm:col-span-6 col-span-12">
              <label className="block text-[12px] text-gray-700">City</label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                placeholder="City"
                className="block w-full px-2 py-2 text-gray-500 bg-white border border-gray-200   placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
              />
            </div>

            <div className="sm:col-span-6 col-span-12">
              <label className="block text-[12px] text-gray-700">State</label>
              <input
                type="text"
                name="location.state"
                value={formData.location.state}
                onChange={handleChange}
                placeholder="State"
                className="block w-full px-2 py-2 text-gray-500 bg-white border border-gray-200  placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
              />
            </div>

            <div className="sm:col-span-6 col-span-12">
              <label className="block text-[12px] text-gray-700">Zip Code</label>
              <input
                type="number"
                name="location.zipCode"
                value={formData.location.zipCode}
                onChange={handleChange}
                placeholder="Zip Code"
                className="block w-full px-2 py-2 text-gray-500 bg-white border border-gray-200   placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
              />
            </div>

            <div className="sm:col-span-6 col-span-12">
              <label className="block text-[12px] text-gray-700">Phone Number</label>
              <PhoneInput
                country={"in"}
                value={formData.contactInfo.phoneNumber}
                onChange={(phone) =>
                  setFormData({
                    ...formData,
                    contactInfo: { ...formData.contactInfo, phoneNumber: phone },
                  })
                }
                className="w-full rounded-0"
              />
            </div>

            <div className="col-span-12">
              <label className="block  text-[12px] text-gray-700">Email</label>
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleChange}
                placeholder="Enter Mail ID"
                className="block w-full px-2 py-2 text-gray-500 bg-white border border-gray-200  placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
              />
            </div>

          </div>

          <div>
            <label className="block  text-[12px] text-gray-700">Courses</label>
            {formData.courses.map((course, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={course}
                  onChange={(e) => handleCourseChange(index, e.target.value)}
                  className="block w-full px-2 py-2 mt-1 text-gray-500 bg-white border border-gray-200 placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                >
                  <option value="">Select a Course</option>
                  {allCourses.map((courseOption, i) => (
                    <option key={i} value={courseOption._id}>
                      {courseOption.course_name}
                    </option>
                  ))}
                </select>

                {formData.courses.length > 1 && (
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

            <button type="button" onClick={addCourse} className="bg-[#29234b] mt-3 rounded-md flex items-center text-white text-sm px-4 py-2">
              <CirclePlus size={16} className="me-1" /> Add Course
            </button>
          </div>


          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`${!isFormValid || loading ? "bg-gray-400" : "bg-[#6cb049]"
                } text-white w-full font-bold py-2 px-4 rounded-md`}
            >
              {loading ? "Submitting..." : "Add Branch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

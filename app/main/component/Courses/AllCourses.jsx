"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/Loader/Loader";
import { Pen, Trash,Book } from "lucide-react"
import Input from '@/components/input/Input';

export default function AllCourses() {
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editCourse, setEditCourse] = useState(null); // State to track the course being edited
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoryResponse = await axios.get("/api/CoursesCategory/fetchall/CoursesCategory");
        setCategories(categoryResponse.data.fetch);

        const courseResponse = await axios.get("/api/course/fetchall/courses");
        setAllCourses(courseResponse.data.fetch || []);
        setFilteredCourses(courseResponse.data.fetch || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setSelectedCategory(selectedCategoryId);

    if (selectedCategoryId === "") {
      setFilteredCourses(allCourses);
    } else {
      const filtered = allCourses.filter((course) => course.category === selectedCategoryId);
      setFilteredCourses(filtered);
    }
    setCurrentPage(1);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.category : "Unknown Category";
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course?");
    if (confirmDelete) {
      try {
        const response = await axios.delete("/api/course/delete", { data: { id } });
        alert(response.data.message);
        const updatedCourses = allCourses.filter((course) => course._id !== id);
        setAllCourses(updatedCourses);
        setFilteredCourses(updatedCourses);
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("There was an error deleting the course.");
      }
    }
  };

  const handleEditClick = (course) => {
    setEditCourse({ ...course });
  };

  const handleUpdate = async () => {
    setUpdateLoading(true);
    try {
      const response = await axios.patch("/api/course/update", {
        id: editCourse._id, // Send only necessary fields
        ...editCourse,      // Include the updated course data
      });
      alert(response.data.message);
      const updatedCourses = allCourses.map((course) =>
        course._id === editCourse._id ? editCourse : course
      );
      setAllCourses(updatedCourses);
      setFilteredCourses(updatedCourses);
      setEditCourse(null);
    } catch (error) {
      console.error("Error updating course:", error);
      alert("There was an error updating the course.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditCourse({ ...editCourse, [name]: value });
  };

  const indexOfLastCourse = currentPage * itemsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - itemsPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  return (
    <div className="shadow-lg rounded-md relative overflow-auto h-5/6 p-2 bg-white">
      {/* Category Filter Dropdown */}
      <div className="mb-4">
        <label htmlFor="category" className="mr-2 font-semibold">
          Filter by Category:
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="border border-gray-300 rounded-md px-2 py-1"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.category}
            </option>
          ))}
        </select>
      </div>

      {/* Course Table */}
      <table className="w-full text-sm text-left text-gray-600 font-sans">
        <thead className="bg-[#29234b] text-white uppercase">
          <tr>
            <th className="px-4 py-2">Course Name</th>
            <th className="px-4 py-2">Course Fees</th>
            <th className="px-4 py-2">Enroll Fees</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6">
                <Loader />
              </td>
            </tr>
          ) : currentCourses.length > 0 ? (
            currentCourses.map((course) => (
              <tr key={course._id} className="border-b cursor-pointer hover:bg-gray-100 odd:bg-gray-50 even:bg-gray-100 transition-colors duration-200">
                <td className="px-4 py-2 font-semibold text-gray-900 text-sm whitespace-nowrap">{course.course_name}</td>
                <td>{course.fees}</td>
                <td className="px-4 py-2 text-[12px] truncate max-w-[150px] relative group">{course.enrollpercent}%</td>
                <td className="px-4 py-2 text-[12px]">{getCategoryName(course.category)}</td>
                <td className="px-4 py-2 text-[12px] truncate max-w-[150px] relative group">
                  {course.description.slice(0, 50)}...
                  <span className="hidden group-hover:block fixed top-0 left-0 bg-white border border-gray-300 p-2 rounded-md shadow-lg z-10 ">
                    {course.description}
                  </span>
                </td>
                <td className=" flex items-center p-1 justify-end gap-4">
                  <button onClick={() => handleEditClick(course)} className="text-blue-500 py-1 px-2 bg-blue-200/50 hover:bg-blue-500 hover:text-white rounded-md font-semibold ">
                    <Pen size={15} />
                  </button>
                  <button onClick={() => handleDelete(course._id)} className="text-red-500 py-1 px-2 bg-red-200/50 hover:bg-red-500 hover:text-white rounded-md font-semibold ">
                    <Trash size={15} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No Courses available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editCourse && (
        <div className="fixed z-50 inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white z-50 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Course</h2>
            <Input
              type="text"
              name="course_name"
              value={editCourse.course_name}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2"
              placeholder="Course Name"
              icon={<Book size={15} />}
            />
            <Input
              type="number"
              name="fees"
              min="0"
              value={editCourse.fees}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2"
              placeholder="Fees"
              icon={<Book size={15} />}
            />
            <Input
              type="number"
              name="enrollpercent"
              min="0"
              value={editCourse.enrollpercent}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2"
              placeholder="Enroll Percent"
              icon={<Book size={15} />}
            />
            <textarea
              name="description"
              value={editCourse.description}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2"
              placeholder="Description"
            />
            <button
              onClick={handleUpdate}
              disabled={updateLoading}
              className={`w-full text-white bg-[#6cb049] py-3 px-5 rounded-md hover:bg-[#57a23e] ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {updateLoading ? "Updating..." : "Update"}
            </button>
            <button onClick={() => setEditCourse(null)} className="bg-gray-300 px-4 py-2 rounded-md mt-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-200 px-4 py-2 rounded-md"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-200 px-4 py-2 rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  );
}

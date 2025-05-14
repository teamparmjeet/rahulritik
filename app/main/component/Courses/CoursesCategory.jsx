"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Input from "@/components/input/Input";
import toast, { Toaster } from "react-hot-toast";
import { ChartBar, PlusCircle, Loader, Trash, Pen } from "lucide-react";
import "react-phone-input-2/lib/style.css";

export default function Page() {
  const [formData, setFormData] = useState({
    category: "",
    id: null, // Store the ID of the category being edited
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Fetch categories after the category list modal is opened
  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "/api/CoursesCategory/fetchall/CoursesCategory"
      );
      setCategories(response.data.fetch.reverse()); // Show latest first
    } catch (error) {
      console.error("Error fetching category data:", error);
      toast.error("Error fetching category data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.id) {
        // Update category
        await axios.patch("/api/CoursesCategory/update", formData);
        toast.success("Course Category updated successfully");
        window.location.reload();
      } else {
        // Create category
        await axios.post("/api/CoursesCategory/create", formData);
        toast.success("Course Category created successfully");
        window.location.reload();
      }

      // Reset form data and refresh categories
      setFormData({ category: "", id: null });
      fetchCategoryData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error in saving category";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Toggle form modal for adding/updating categories
  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      setShowCategoryList(false); // Close category list if form is opened
      setFormData({ category: "", id: null }); // Reset form data
    }
  };

  // Toggle modal for viewing categories
  const toggleCategoryList = () => {
    setShowCategoryList(!showCategoryList);
    if (!showCategoryList) {
      setShowForm(false); // Close form if category list is opened
      fetchCategoryData(); // Fetch categories when list modal opens
    }
  };

  const handleEdit = (category) => {
    setFormData({ category: category.category, id: category._id });
    setShowForm(true); // Show form for editing
    setShowCategoryList(false); // Close category list
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await axios.delete("/api/CoursesCategory/delete", { data: { id } });
      toast.success("Category deleted successfully");
      window.location.reload();
      fetchCategoryData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error in deleting category";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <Toaster />
      <div className="">
        <div className="bg-[#29234b] text-white p-4 ">
          <div className=" flex justify-between">
            <h1 className="text-md font-bold mb-2">Categories</h1>

          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleForm}
              className="flex items-center gap-1 bg-[#6cb049] text-white px-3 py-1 rounded-md hover:bg-[#57a23e] transition"
            >
              <PlusCircle size={18} />
              <span className="text-sm">Add Categories</span>
            </button>
            <button
              onClick={toggleCategoryList}
              className="flex items-center gap-1 bg-[#6cb049] text-white px-3 py-1 rounded-md hover:bg-[#57a23e] transition"
            >
              <span className="text-sm">View Categories</span>
            </button>
          </div>
        </div>

        {/* Modal for Adding/Updating Category */}
        {showForm && (
          <form
            className="p-5 bg-white shadow-md rounded-md"
            onSubmit={handleSubmit}
          >
            <Input
              placeholder="Enter Category Name"
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              icon={<ChartBar size={15} />}
              required
            />
            <button
              type="submit"
              className={`w-full mt-2 text-white bg-[#6cb049] py-3 px-5 rounded-md hover:bg-[#57a23e] transition ${loading ? "cursor-not-allowed opacity-50" : ""
                }`}
              disabled={loading}
            >
              {loading ? <Loader size={20} className="animate-spin" /> : formData.id ? "Update Category" : "Register Category"}
            </button>
          </form>
        )}

        {/* Modal for Viewing Categories */}
        {showCategoryList && (
          <div className="p-3 bg-white shadow-md rounded-md max-h-64 overflow-y-auto">
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : (
              <>

                <p className="text-md font-semibold">Total: <span className="text-[#6cb049]">{categories.length}</span></p>
                {categories.length ? (
                  categories.map((item, index) => (
                  
                      <div
                        key={item._id}
                        className="flex justify-between items-center bg-white border border-gray-300 px-2 py-1 rounded-md mb-3"
                      >

                        <p className="text-gray-800 text-sm">
                          <span className="text-gray-500">{`${index + 1}. `}</span>
                          {item.category}
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md p-1 transition-colors"
                            title="Edit"
                          >
                            <Pen size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-md p-1 transition-colors"
                            title="Delete"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                   
                  ))
                ) : (
                  <p className="text-gray-500">No categories available</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

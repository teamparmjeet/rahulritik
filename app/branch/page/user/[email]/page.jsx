"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader/Loader';
import { Pencil, Check, X } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Shield } from "lucide-react"
import { useRouter } from "next/navigation";

export default function AdminData({ params }) {
  const [branches, setBranches] = useState([]);
  const [user, setUser] = useState(null);

  const { email } = params;
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editField, setEditField] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get(`/api/admin/find-admin-byemail/${email}`);
        setAdminData(response.data);
        setUser(response.data._id)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [email]);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get('/api/branch/fetchall/branch');
        setBranches(response.data.fetch);
      } catch (error) {
        console.error('Error fetching branch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranchData();
  }, []);


  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : "T";
  };
  const handleEditClick = (field) => {
    setEditField(field);
    setUpdatedData({ ...adminData });
  };

  const handleCancelClick = () => {
    setEditField(null);
    setUpdatedData({});
    setPasswords({ newPassword: "", confirmPassword: "" });
    setShowPasswordFields(false);
  };

  const handleSaveClick = async () => {
    try {
      //   setLoading(true);
      const updates = {
        name: updatedData.name,
        email: adminData.email,
        mobile: updatedData.mobile,
        branch: updatedData.branch,
        status: updatedData.status,
      };


      if (showPasswordFields) {
        if (passwords.newPassword === passwords.confirmPassword) {
          updates.password = passwords.newPassword;
        } else {

          toast.error("Password mismatch")
          setLoading(false);
          return;
        }
      }


      await axios.patch(`/api/admin/update`, updates);

      toast.success("update Success")
      setAdminData({ ...adminData, ...updatedData });
      handleCancelClick();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, field) => {
    setUpdatedData({ ...updatedData, [field]: e.target.value });
  };

  const handleShowPasswordFields = () => {
    setShowPasswordFields(true);
  };


  const handledelete = async () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this User?");

    if (isConfirmed) {
      try {
        await axios.delete(`/api/admin/delete/${user}`);
        router.push("/branch/page/staff");
        toast.success("User deleted successfully!");
      } catch (error) {
        console.error('Error deleting User:', error);
        toast.error("Failed to delete the User.");
      }
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="container lg:w-[90%] mx-auto py-5">
      <Toaster />
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">


        <div className="p-4">
          <div className="border-b py-4 flex items-center gap-x-4">
            <div className="bg-[#6cb049] text-white flex font-bold items-center justify-center h-16 w-16 text-3xl rounded-full border-4 border-white shadow-lg">
              {getFirstLetter(adminData?.name || "T")}
            </div>
            {adminData && (
              <div className="text-2xl text-gray-800">
                {adminData.usertype === "2" ? (
                  <span className="font-semibold">Tifa Admin</span>
                ) : adminData.usertype === "1" ? (
                  <span className="font-semibold">Branch Admin at </span>
                ) : adminData.usertype === "0" ? (
                  <span className="font-semibold">Staff at </span>
                ) : (
                  <span className="font-semibold">Unknown</span>
                )}
                <span className="text-gray-600">{adminData.usertype !== "2" ? adminData.branch : null}</span>
              </div>
            )}
          </div>


          {adminData && (
            <div>

              <div className="flex justify-between items-center border-b py-4">
                <div>
                  <span className="font-medium flex gap-x-2 items-center">
                    Name
                  </span>
                  {editField === "name" ? (
                    <input
                      type="text"
                      className="block w-full px-2 py-2 text-gray-500 bg-white border border-gray-200 rounded-md placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                      value={updatedData.name}
                      onChange={(e) => handleInputChange(e, "name")}
                    />
                  ) : (
                    <p className="text-gray-600 text-sm flex gap-x-2 items-center">
                      {adminData.name}
                    </p>
                  )}
                </div>

                <div>
                  {editField === "name" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveClick}
                        className="bg-[#6cb049] text-white px-4 py-1 rounded-md"
                      >
                        <Check />
                      </button>
                      <button
                        onClick={handleCancelClick}
                        className="bg-red-500 text-white px-4 py-1 rounded-md"
                      >
                        <X />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditClick("name")}
                      className="border border-green-100 px-5 py-1 rounded-md hover:bg-green-50 duration-150 text-[#6cb049]"
                    >
                      <Pencil />
                    </button>
                  )}
                </div>
              </div>


              <div className="flex justify-between items-center border-b py-4">
                <div>
                  <span className="font-medium flex gap-x-2 items-center">
                    Email Address
                  </span>
                  <p className="text-gray-600 text-sm flex gap-x-2 items-center">
                    {adminData.email}
                  </p>
                </div>
              </div>




              <div className="flex justify-between items-center border-b py-4">
                <div>
                  <h2 className="font-medium flex gap-x-2 items-center">Status</h2>
                  {editField === "status" ? (
                    <div className="relative">
                      <label htmlFor="status" className="px-2 absolute h-full flex items-center text-green-500">
                        <Shield size={15} />
                      </label>
                      <select
                        name="status"
                        id="status"
                        value={updatedData.status || adminData.status}
                        onChange={(e) => handleInputChange(e, "status")}
                        className="block w-full px-7 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                        required
                      >
                        <option value="true">🟢 Active</option>
                        <option value="false">🔴 Deactive</option>
                      </select>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm flex gap-x-2 items-center">
                      <div className="relative">
                        <label htmlFor="status" className="px-2 absolute h-full flex items-center text-green-500">
                          <Shield size={15} />
                        </label>
                        <select
                          name="status"
                          id="status"
                          disabled
                          value={updatedData.status || adminData.status}
                          onChange={(e) => handleInputChange(e, "status")}
                          className="block w-full px-7 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                          required
                        >
                          <option value="true">🟢 Active</option>
                          <option value="false">🔴 Deactive</option>
                        </select>
                      </div>
                    </p>
                  )}
                </div>


                <div>
                  {editField === "status" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveClick}
                        className="bg-[#6cb049] text-white px-4 py-1 rounded-md"
                      >
                        <Check />
                      </button>
                      <button
                        onClick={handleCancelClick}
                        className="bg-red-500 text-white px-4 py-1 rounded-md"
                      >
                        <X />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditClick("status")}
                      className="border border-green-100 px-5 py-1 rounded-md hover:bg-green-50 duration-150 text-[#6cb049]"
                    >
                      <Pencil />
                    </button>
                  )}
                </div>
              </div>


              <div className="flex justify-between items-center border-b py-4">
                <div>
                  <span className="font-medium flex gap-x-2 items-center">
                    Phone Number
                  </span>
                  {editField === "mobile" ? (
                    <PhoneInput
                      country={"in"}

                      onChange={(value) =>
                        setUpdatedData({ ...updatedData, mobile: value })
                      }
                    />
                  ) : (
                    <p className="text-gray-600 text-sm flex gap-x-2 items-center">
                      {adminData.mobile}
                    </p>
                  )}
                </div>

                <div>
                  {editField === "mobile" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveClick}
                        className="bg-[#6cb049] text-white px-4 py-1 rounded-md"
                      >
                        <Check />
                      </button>
                      <button
                        onClick={handleCancelClick}
                        className="bg-red-500 text-white px-4 py-1 rounded-md"
                      >
                        <X />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditClick("mobile")}
                      className="border border-green-100 px-5 py-1 rounded-md hover:bg-green-50 duration-150 text-[#6cb049]"
                    >
                      <Pencil />
                    </button>
                  )}
                </div>
              </div>


              <div className="border-b py-4">

                {!showPasswordFields ? (
                  <button
                    onClick={handleShowPasswordFields}
                    className="border border-green-100 px-5 py-1 rounded-md hover:bg-green-50 duration-150 text-[#6cb049]"
                  >
                    Change Password
                  </button>
                ) : (
                  <div className="grid gap-4 mt-2">
                    <input
                      type="password"
                      placeholder="New Password"
                      className="border border-gray-300 rounded-md p-2"
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, newPassword: e.target.value })
                      }
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="border border-gray-300 rounded-md p-2"
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirmPassword: e.target.value })
                      }
                    />
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={handleSaveClick}
                        className="bg-[#6cb049] text-white px-4 py-1 rounded-md"
                      >
                        Update Password
                      </button>
                      <button
                        onClick={handleCancelClick}
                        className="bg-red-500 text-white px-4 py-1 rounded-md"
                      >
                        <X />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <button
                  onClick={handledelete}
                  className="py-2 px-4 bg-red-600 text-white rounded"
                >
                  Delete This User
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

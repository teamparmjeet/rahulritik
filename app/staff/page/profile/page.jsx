"use client";
import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import Loader from "@/components/Loader/Loader";
import { Pencil, Check, X } from "lucide-react"; 
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import toast, { Toaster } from 'react-hot-toast';

export default function Page() {
  const { data: session } = useSession();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get(
          `/api/admin/find-admin-byemail/${session?.user?.email}`
        );
        setAdminData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) fetchAdminData();
  }, [session]);

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

  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : "T";
  };

  return (
    <div className="container lg:w-[90%] mx-auto py-5">
          <Toaster />
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-[#6cb049] text-white p-4 flex justify-between items-center">
          <h1 className="text-lg font-bold">Your Account</h1>
          <button
            className="bg-white text-[#6cb049] text-sm px-4 py-2 rounded shadow hover:bg-gray-100"
            onClick={() => signOut()}
          >
            Sign Out
          </button>
        </div>

        <div className="p-4">
          <div className="border-b py-4 flex items-center gap-x-4">
            <div className="bg-[#6cb049] text-white flex font-bold items-center justify-center h-16 w-16 text-3xl rounded-full">
              {getFirstLetter(adminData?.name || "T")}
            </div>
            {adminData && (
              <div className="text-2xl text-gray-500">
                {adminData.usertype === "2"
                  ? "Tifa Admin"
                  : adminData.usertype === "1"
                  ? `Branch Admin ${adminData.branch}`
                  : adminData.usertype === "0"
                  ? `Staff at ${adminData.branch}`
                  : "Unknown"}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

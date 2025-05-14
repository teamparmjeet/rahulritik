"use client";
import React, { useState } from "react";
import Input from "@/components/input/Input";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function Signin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const isFormValid = () => {
    return Object.values(formData).every((field) => field.trim() !== "");
  };




  const handleSubmit = async (e) => {
    const fetchUserData = async (email) => {
      try {
        const response = await axios.get(`/api/admin/find-admin-byemail/${email}`);
        return response.data;
      } catch (error) {
        toast.error("Failed to fetch user data. Please try again.");
        setLoading(false);
        return null;
      }
    };
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any previous errors

    try {
      const userData = await fetchUserData(formData.email);
      if (!userData) {
        toast.error("No user found with this email.");
        setLoading(false);
        return;
      }
      if (userData.status === false) {
        toast.error("This account is deactivated. Please contact admin.");
        setLoading(false);
        return;
      }
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res.error) {
        toast.error("Invalid Credentials");
        setLoading(false);
        return;
      }


      toast.success("Successfully signed in!");


      if (userData.usertype === "2") {
        router.push("/main");
      } else if (userData.usertype === "1") {
        router.push("/branch");
      } else if (userData.usertype === "0") {
        router.push("/staff");
      } else {
        setError("Invalid user type.");
        setLoading(false);
      }
    } catch (error) {
      handleSignInError(error);
    }
  };


  const handleSignInError = (error) => {
    if (axios.isAxiosError(error) && error.response) {
      toast.error(
        "Server error: " + (error.response.data.message || "An error occurred.")
      );
    } else {
      toast.error("Invalid Credentials. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <section className="min-h-screen bg-green-50 flex flex-col  items-center justify-center px-4">
        <Image src="/image/profile/tifaindia_logo.webp" alt="Logo" width={200} height={200} />
        <Toaster />
        <div className="w-full border max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
          <div className="">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Sign in to your account</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                placeholder="Enter Email"
                type="email"
                id="email"
                name="email"
                icon={<Mail size={15} />}
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
            <div className="relative">
              <Input
                placeholder="Enter Password"
                type={showPassword ? "text" : "password"} // Toggle password visibility
                id="password"
                name="password"
                icon={<Lock size={15} />}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                className="pr-10"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)} // Toggle the visibility
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </div>
            </div>
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className={`w-full py-2 px-4 rounded-lg shadow-lg transform transition duration-300 ease-in-out ${isFormValid() && !loading
                ? "bg-[#005ca8] text-white hover:bg-[#005ca8] hover:scale-105"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
                } focus:outline-none focus:ring-2 focus:ring-[#005ca8]`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

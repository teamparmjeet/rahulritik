"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/Loader/Loader";
import { useSession } from 'next-auth/react';
import Link from "next/link";
import { PhoneCall, CheckCircle, CircleDashed, Navigation, Locate, LocateOff, Trash } from "lucide-react";
export default function Lead() {
    const [allquery, setAllquery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gridLoading, setGridLoading] = useState(true);
    // Filter states
    const [referenceId, setReferenceId] = useState("");
    const [suboption, setSuboption] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [admission, setAdmission] = useState("");
    const [grade, setGrade] = useState("");
    const [location, setLocation] = useState("");
    const [city, setCity] = useState("");
    const [assignedName, setAssignedName] = useState("");
    const [userName, setUserName] = useState("");
    const [referenceData, setReferenceData] = useState([]);
    const [branches, setBranches] = useState([]);
    const [branch, setBranch] = useState("");

    const [allCourses, setAllCourses] = useState([]);
    const [cours, setCours] = useState("");


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

    const [user, setuser] = useState([]);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedReference, setSelectedReference] = useState(null);
    const { data: session } = useSession();

    const [adminData, setAdminData] = useState(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await axios.get(
                    `/api/admin/find-admin-byemail/${session?.user?.email}`
                );
                setAdminData(response.data.branch);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.email) fetchAdminData();
    }, [session]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (adminData) {
                    const userResponse = await axios.get(`/api/admin/fetchall-bybranch/${adminData}`);
                    setuser(userResponse.data.fetch);
                }
                const branchesResponse = await axios.get("/api/branch/fetchall/branch");
                setBranches(branchesResponse.data.fetch);
                const referenceResponse = await axios.get("/api/reference/fetchall/reference");
                setReferenceData(referenceResponse.data.fetch);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Error fetching data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [adminData]);

    const removeFilter = () => {
        setReferenceId(""); // Reset ReferenceId filter
        setSuboption("");   // Reset Suboption filter
        setFromDate("");    // Reset FromDate filter
        setToDate("");      // Reset ToDate filter
        setAdmission("");   // Reset Admission filter
        setGrade("");       // Reset Grade filter
        setLocation("");    // Reset Location filter
        setCity("");        // Reset City filter
        setAssignedName(""); // Reset Assigned Name filter
        setUserName("");    // Reset UserName filter
        setBranch("");      // Reset Branch filter
        setCours("");       // Reset Course filter
        setTimeout(() => {
            fetchFilteredData("");
        }, 0);
    };

    const fetchFilteredData = async () => {
        setGridLoading(true);
        try {
            const response = await axios.get("/api/branchreport/lead/query", {
                params: {
                    referenceId,
                    suboption,
                    fromDate,
                    toDate,
                    admission,
                    grade,
                    location,
                    city,
                    assignedName,
                    userName,
                    branch,
                    cours,
                    adminData
                },
            });
            setAllquery(response.data.fetch);
        } catch (error) {
            console.error("Error fetching filtered data:", error);
        } finally {
            setGridLoading(false);
        }
    };

    useEffect(() => {
        if (adminData) {  // Ensure adminData is available before fetching
            fetchFilteredData();
        }
    }, [adminData]);


    const handleFilter = () => {
        setIsFilterModalOpen(false); // Close modal
        fetchFilteredData();
    };






    const handleReferenceChange = (e) => {
        const selectedName = e.target.value;
        setReferenceId(selectedName);
        const reference = referenceData.find((data) => data.referencename === selectedName);
        setSelectedReference(reference || null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader />
            </div>
        );
    }



    return (
        <div className="p-6 bg-white shadow-xl rounded-xl">
            <div className="text-3xl font-bold text-center text-white bg-blue-600 py-4 rounded-t-xl shadow-md">
                Lead Report
            </div>

            <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-b-xl'>
                <div className="flex flex-col bg-white px-2 py-1 rounded-lg shadow-md">
                    <label className="font-semibold mb-2 text-gray-700">Staff</label>
                    <select
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="p-2 border "
                    >
                        <option value="">All</option>
                        {user.map((data) => (
                            <option key={data._id} value={data.name}>
                                {data.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col bg-white px-2 py-1 rounded-lg shadow-md">
                    <label className="font-semibold mb-2 text-gray-700">Course</label>
                    <select
                        value={cours}
                        onChange={(e) => setCours(e.target.value)}
                        className="p-2 border"
                    >
                        <option value="">All</option>
                        {allCourses.map((data, index) => (
                            <option key={index} value={data._id}>
                                {data.course_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col bg-white px-2 py-1 rounded-lg shadow-md">
                    <label className="font-semibold mb-2 text-gray-700">Reference</label>
                    <select
                        value={referenceId}
                        onChange={handleReferenceChange}
                        className="p-2 border"
                    >
                        <option value="">All</option>
                        {referenceData.map((data) => (
                            <option key={data._id} value={data.referencename}>
                                {data.referencename}
                            </option>
                        ))}
                    </select>


                    {selectedReference?.referencename === "Online" && selectedReference.suboptions?.length > 0 && (


                        <select
                            value={suboption}
                            onChange={(e) => setSuboption(e.target.value)}
                            className="p-2 border"
                        >
                            <option value="">All</option>
                            {selectedReference.suboptions.map((suboption, index) => (
                                <option key={index} value={suboption.name}>
                                    {suboption.name}
                                </option>
                            ))}
                        </select>

                    )}
                </div>

                <div className="flex flex-col bg-white px-2 py-1 rounded-lg shadow-md">
                    <label className="font-semibold mb-2 text-gray-700">Branch</label>
                    <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="p-2 border"
                    >
                        <option value="">All</option>
                        {branches.map((data, index) => (
                            <option key={index} value={data.branch_name}>
                                {data.branch_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col bg-white px-2 py-1 rounded-lg shadow-md">
                    <label className="font-semibold mb-2 text-gray-700">City</label>
                    <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="p-2 border"
                    >
                        <option value="">All</option>
                        <option value="Jaipur">Jaipur</option>
                        <option value="out">Out Of Jaipur</option>
                    </select>
                </div>

                <div className="flex  items-center gap-4 col-span-2 bg-white px-2 py-1 rounded-lg shadow-md">
                    <label className="font-semibold mb-2 text-gray-700">Created Date</label>
                    <div className="  bg-white flex justify-between gap-2">

                        <div>

                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="p-2 border"
                            />
                        </div>
                        <p className=" text-black text-center items-center flex">To</p>
                        <div>

                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="p-2 border"
                            />
                        </div>
                    </div>
                </div>

            </div>

            <button onClick={fetchFilteredData} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600">
                Apply Filters
            </button>
            <button
                onClick={removeFilter}
                className="ml-4 bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition duration-200"
            >
                Remove Filters
            </button>
            {gridLoading ? (
                <div className="flex items-center justify-center w-full col-span-4">
                    <Loader />  {/* Show loader while grid data is loading */}
                </div>
            ) : (
                <>
                    <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6 p-6 mt-6 bg-gray-50 rounded-xl'>
                        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
                            <div className='flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full'>
                                <PhoneCall className='w-8 h-8 text-blue-500' />
                            </div>
                            <div className='ml-4'>
                                <p className='text-xl font-bold text-gray-800'>{allquery.length}</p>
                                <p className='text-gray-500'>Total Query</p>
                            </div>
                        </div>

                        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
                            <div className='flex items-center justify-center w-16 h-16 bg-green-100 rounded-full'>
                                <CheckCircle className='w-8 h-8 text-green-500' />
                            </div>
                            <div className='ml-4'>
                                <p className='text-xl font-bold text-gray-800'>{allquery.filter(item => item.addmission == true).length}
                                </p>
                                <p className='text-gray-500'>Enrolled Queries</p>
                            </div>
                        </div>

                        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
                            <div className='flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full'>
                                <CircleDashed className='w-8 h-8 text-orange-500' />
                            </div>
                            <div className='ml-4'>
                                <p className='text-xl font-bold text-gray-800'>{allquery.filter(item => item.addmission == false && item.autoclosed === "open").length}
                                </p>
                                <p className='text-gray-500'>Pending Queries</p>
                            </div>
                        </div>

                        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
                            <div className='flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full'>
                                <Navigation className='w-8 h-8 text-blue-500' />
                            </div>
                            <div className='ml-4'>
                                <p className='text-xl font-bold text-gray-800'>{allquery.filter(item => item.demo == true).length}
                                </p>
                                <p className='text-gray-500'>Demo Queries</p>
                            </div>
                        </div>

                        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
                            <div className='flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full'>
                                <Locate className='w-8 h-8 text-blue-500' />
                            </div>
                            <div className='ml-4'>
                                <p className='text-xl font-bold text-gray-800'>{allquery.filter(item => item.stage === 6).length}
                                </p>
                                <p className='text-gray-500'>Visited Queries</p>
                            </div>
                        </div>


                        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
                            <div className='flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full'>
                                <Locate className='w-8 h-8 text-blue-500' />
                            </div>
                            <div className='ml-4'>
                                <p className='text-xl font-bold text-gray-800'>{allquery.filter(item => item.studentContact.city === "Jaipur").length}
                                </p>
                                <p className='text-gray-500'>Jaipur Queries</p>
                            </div>
                        </div>

                        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
                            <div className='flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full'>
                                <LocateOff className='w-8 h-8 text-gray-500' />
                            </div>
                            <div className='ml-4'>
                                <p className='text-xl font-bold text-gray-800'>{allquery.filter(item => item.studentContact.city !== "Jaipur").length}
                                </p>
                                <p className='text-gray-500'>Out Of Jaipur Queries</p>
                            </div>
                        </div>

                        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
                            <div className='flex items-center justify-center w-16 h-16 bg-red-100 rounded-full'>
                                <Trash className='w-8 h-8 text-red-500' />
                            </div>
                            <div className='ml-4'>
                                <p className='text-xl font-bold text-gray-800'>{allquery.filter(item => item.autoclosed === "close" && item.addmission === false).length
                                }
                                </p>
                                <p className='text-gray-500'>Trash Queries</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

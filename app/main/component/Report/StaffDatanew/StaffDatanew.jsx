"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PhoneCall, CheckCircle, Navigation, XCircle, Loader } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import * as XLSX from "xlsx";

export default function StaffDatanew({ staffid }) {
    const [userData, setUserData] = useState(null);
    const [adminData, setAdminData] = useState(null);
    const [queries, setQueries] = useState([]);
    const [data, setData] = useState([]);
    const [data1, setData1] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQueries, setSelectedQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split("T")[0];
    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });


    const [user, setUser] = useState([]);
    const [activeDay, setActiveDay] = useState(null);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [filteredDates, setFilteredDates] = useState([]);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    const [monthlyActivity, setMonthlyActivity] = useState(null);


    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await axios.get(`/api/admin/find-admin-byemail/${staffid}`);
                setUserData(response.data);
                setAdminData(response.data._id);
            } catch (err) {
                console.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (staffid) fetchAdminData();
    }, [staffid]);

    useEffect(() => {
        const fetchQueryData = async () => {
            if (adminData) {
                try {
                    setLoading(true);
                    const response = await axios.get(`/api/report/dailyreport/${adminData}`);
                    setData(response.data.data.userActivityReport);
                    setData1(response.data.data.userActivityReport.dailyConnectionStatus);
                } catch (error) {
                    console.error("Error fetching query data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchQueryData();
    }, [adminData]);

    useEffect(() => {
        const fetchQueries = async () => {
            if (adminData) {
                try {
                    setLoading(true);
                    const response = await axios.get(`/api/queries/fetchall-byuser/${adminData}?autoclosed=open`);
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(today.getDate() + 1);

                    const filteredQueries = response.data.fetch.filter(query => {
                        const deadline = new Date(query.deadline);
                        return deadline <= tomorrow;
                    });

                    setQueries(filteredQueries);
                } catch (error) {
                    console.error("Error fetching query data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchQueries();
    }, [adminData]);

    const handleButtonClick = () => {
        const queries = data.dailyActivity?.[today]?.queries || [];
        setSelectedQueries(queries);
        setIsModalOpen(true);
    };
    const removeFilter = () => {
        // Reset the filter states
        setSelectedYear("");
        setSelectedMonth("");
        setStartDate("");
        setEndDate("");

        // Reset the filtered dates to an empty array
        setFilteredDates([]);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get("/api/admin/fetchall/admin");
                setUser(response.data.fetch);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (data.dailyActivity) {
            let filtered = Object.entries(data.dailyActivity);

            if (selectedYear || selectedMonth || startDate || endDate) {
                if (selectedYear) {
                    filtered = filtered.filter(([day]) => new Date(day).getFullYear().toString() === selectedYear);
                }
                if (selectedMonth) {
                    filtered = filtered.filter(([day]) => (new Date(day).getMonth() + 1).toString() === selectedMonth);
                }
                if (startDate) {
                    filtered = filtered.filter(([day]) => new Date(day) >= new Date(startDate));
                }
                if (endDate) {
                    filtered = filtered.filter(([day]) => new Date(day) <= new Date(endDate));
                }
                setFilteredDates(filtered);
            } else {
                setFilteredDates([]);
            }
        }
    }, [selectedYear, selectedMonth, startDate, endDate, data.dailyActivity]);

    const getUserName = (id) => {
        const matchedUser = user.find((u) => u._id === id);
        return matchedUser ? matchedUser.name : "Unknown User";
    };

    const years = Array.from(
        new Set(Object.keys(data.dailyActivity || {}).map((day) => new Date(day).getFullYear()))
    );
    const months = selectedYear
        ? Array.from(
            new Set(
                Object.keys(data.dailyActivity || {})
                    .filter((day) => new Date(day).getFullYear().toString() === selectedYear)
                    .map((day) => new Date(day).getMonth() + 1)
            )
        )
        : [];

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-100">
                <Loader className="animate-spin w-16 h-16 text-blue-500" />
            </div>
        );
    }
    const calculateFilteredTotals = () => {
        let filteredEntries = filteredDates || [];

        // Initialize total values
        let totalConnected = 0;
        let totalNoConnected = 0;
        let totalNotLifting = 0;
        let totalUnknown = 0; // New unknown category
        let totalActions = 0;

        filteredEntries.forEach(([day, activity]) => {
            activity.queries.forEach((query) => {
                if (query.connectionStatus && query.connectionStatus.length > 0) {
                    query.connectionStatus.forEach((statusEntry) => {
                        if (statusEntry.status === "connected") {
                            totalConnected++;
                        } else if (statusEntry.status === "no_connected") {
                            totalNoConnected++;
                        } else if (statusEntry.status === "not_lifting") {
                            totalNotLifting++;
                        } else {
                            totalUnknown++; // Count unknown statuses
                        }
                    });
                }
            });
        });

        // Calculate Total Actions (including Unknown)
        totalActions = totalConnected + totalNoConnected + totalNotLifting + totalUnknown;

        return { totalConnected, totalNoConnected, totalNotLifting, totalUnknown, totalActions, filteredEntries };
    };


    // Get calculated totals
    const { totalConnected, totalNoConnected, totalNotLifting, totalActions, filteredEntries } = calculateFilteredTotals();


    const exportToExcel = () => {
        // Convert filtered entries into an array of objects for better structuring
        const formattedData = filteredEntries.map(([date, data]) => ({
            Date: date,
            Connected: data.connected || 0,
            "Not Connected": data.no_connected || 0,
            "Not Lifting": data.not_lifting || 0,
        }));

        // Convert JSON data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();

        // Append the sheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Queries");

        // Save the file
        XLSX.writeFile(workbook, "filtered_queries.xlsx");
    };


    const todayData = data1[today] || {};
    return (
        <>
            <div ref={contentRef} className=" mx-auto my-6">
                <div className="text-xl font-bold text-center text-white bg-gradient-to-r from-blue-600 to-blue-400 py-4 rounded-lg shadow-lg">
                    Staff Report of{" "}
                    <span className="text-yellow-300">{userData?.name}</span> from{" "}
                    <span className="text-yellow-300">{userData?.branch}</span>
                </div>

                {/* Filter Section */}
                <div className="flex flex-wrap justify-around gap-4 items-center mt-6 bg-gray-50 shadow-md p-4 rounded-lg">
                    <div className=" flex gap-2 items-center">
                        <label className="font-semibold">Select Year:</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                setSelectedMonth(""); // Reset month when year changes
                            }}
                            className="bg-gray-100 border border-gray-300 p-2 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
                        >
                            <option value="">Select Year</option>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>

                        <label className="font-semibold">Select Month:</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            disabled={!selectedYear}
                            className="bg-gray-100 border border-gray-300 p-2 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
                        >
                            <option value="">Select Month</option>
                            {months.map((month) => (
                                <option key={month} value={month}>
                                    {new Date(0, month - 1).toLocaleString("en", { month: "long" })}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className=" flex gap-2 items-center">

                        <label className="font-semibold">Start Date:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-gray-100 border border-gray-300 p-2 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
                        />

                        <label className="font-semibold">End Date:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-gray-100 border border-gray-300 p-2 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
                        />
                    </div>
                </div>
                <button
                    onClick={removeFilter}
                    disabled={!selectedYear && !selectedMonth && !startDate && !endDate}
                    className={`ml-4 px-4 py-2 rounded shadow-md transition duration-200 
        ${!selectedYear && !selectedMonth && !startDate && !endDate
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"}`}
                >
                    Remove Filters
                </button>
                <button
                    onClick={exportToExcel}
                    className="bg-blue-500 ms-2 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Export to Excel
                </button>
                <button className="mt-4 ml-4 bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-600" onClick={() => reactToPrintFn()}>Print</button>
                {/* Data Section */}
                <div className="mt-6">
                    {/* Dynamic Heading */}
                    <h1 className="text-xl px-4 font-semibold">
                        {selectedYear || selectedMonth || startDate || endDate
                            ? `Data from ${startDate || "start"} to ${endDate || "end"}`
                            : "Today's Data"}
                    </h1>

                    {/* Data Cards */}
                    <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg shadow-lg">

                        {/* Total Actions */}
                        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-xl font-bold text-gray-800">{totalActions}</p>
                                    <p className="text-gray-500">Total Actions</p>
                                </div>
                            </div>
                        </div>

                        {/* Connected */}
                        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
                            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                                <PhoneCall className="w-8 h-8 text-green-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-xl font-bold text-gray-800">{totalConnected}</p>
                                <p className="text-gray-500">Connected</p>
                            </div>
                        </div>

                        {/* Not Connected */}
                        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
                            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-xl font-bold text-gray-800">{totalNoConnected}</p>
                                <p className="text-gray-500">Not Connected</p>
                            </div>
                        </div>

                        {/* Not Lifting */}
                        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
                            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                                <PhoneCall className="w-8 h-8 text-red-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-xl font-bold text-gray-800">{totalNotLifting}</p>
                                <p className="text-gray-500">Not Lifting</p>
                            </div>
                        </div>
                    </div>
                </div>




                {/* Modal */}
                {isModalOpen && (
                    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                        <div className='bg-white p-6 rounded-lg shadow-lg w-2/3'>

                            <div className='flex justify-between items-center mb-4'>
                                <h2 className='text-xl font-bold'>Queries</h2>
                                <button className='text-red-500' onClick={closeModal}><XCircle /></button>
                            </div>
                            <div className=' overflow-scroll max-h-96'>
                                {selectedQueries.length > 0 ? (
                                    <table className='min-w-full bg-white border border-gray-200'>
                                        <thead>
                                            <tr className='bg-gray-100'>

                                                <th className='border px-4 py-2 text-left'>N/O</th>
                                                <th className='border px-4 py-2 text-left'>Student Name</th>
                                                <th className='border px-4 py-2 text-left'>Contect Number</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedQueries.map((query, index) => (
                                                <tr key={query.id} className='border'>
                                                    <td className='border px-4 py-2'>{index + 1}</td>
                                                    <td className='border px-4 py-2'>{query.studentName}</td>
                                                    <td className='border px-4 py-2'>{query.studentContact.phoneNumber}</td>
                                                </tr>
                                            ))}

                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No queries available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>


            <div className="container lg:w-[95%] mx-auto py-5">
                {/* Dropdowns for year and month */}

                <div className="mt-4 space-y-4">

                    {filteredDates.length === 0 ? (
                        <div></div>
                    ) : (
                        (() => {
                            const grandTotal = filteredDates.reduce((total, [_, activity]) => total + activity.count[0], 0);
                            return (

                                <div className="text-lg font-bold border  border-[#29234b] p-3 rounded">
                                    Total Actions: {grandTotal}
                                </div>
                            );
                        })()
                    )}

                    {/* Display Daily Activity */}
                    {filteredDates.length === 0 ? (
                        <div></div>
                    ) : (
                        filteredDates
                            .sort(([dayA], [dayB]) => new Date(dayB) - new Date(dayA))
                            .map(([day, activity]) => (
                                <>
                                    <div key={day}>
                                        <button
                                            onClick={() => setActiveDay(activeDay === day ? null : day)}
                                            className="bg-[#29234b] hover:bg-[#29234b]/80 text-white font-semibold py-2 px-4 rounded w-full text-left"
                                        >
                                            Date: {day} {activeDay === day ? "▼" : "▶"}
                                        </button>

                                        {activeDay === day && (
                                            <div className="mt-2">
                                                <p className="font-medium text-sm border px-2 bg-gray-50">
                                                    Actions Taken: {activity.count[0]}
                                                </p>
                                                <table className="w-full text-sm text-left rtl:text-right text-gray-600 font-sans mt-2">
                                                    <thead className="bg-[#29234b] text-white uppercase">
                                                        <tr>
                                                            <th scope="col" className="px-4 font-medium capitalize py-2">
                                                                S/N
                                                            </th>
                                                            <th scope="col" className="px-4 font-medium capitalize py-2">
                                                                Student Name
                                                            </th>
                                                            <th scope="col" className="px-4 font-medium capitalize py-2">
                                                                Phone Number
                                                            </th>
                                                            <th scope="col" className="px-4 font-medium capitalize py-2">
                                                                Reference
                                                            </th>
                                                            <th scope="col" className="px-4 font-medium capitalize py-2">
                                                                City
                                                            </th>
                                                            <th scope="col" className="px-4 font-medium capitalize py-2">
                                                                Address
                                                            </th>
                                                            <th scope="col" className="px-4 font-medium capitalize py-2">
                                                                Assigned from
                                                            </th>
                                                            <th scope="col" className="px-4 font-medium capitalize py-2">
                                                                Assigned To
                                                            </th>
                                                            <th scope="col" className="px-4 font-medium capitalize py-2">
                                                                Created Date
                                                            </th>
                                                            <th scope="col" className="px-4 font-medium capitalize py-2">
                                                                Status
                                                            </th>
                                                            <th scope="col" className="px-4 font-medium capitalize py-2">
                                                                Connection Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {activity.queries.map((query, index) => (
                                                            <tr key={index}>
                                                                <td className="px-4 py-2 text-[12px] font-semibold">
                                                                    {index + 1}
                                                                </td>
                                                                <td className="px-4 py-2 text-[12px] font-semibold">
                                                                    {query.studentName}
                                                                </td>
                                                                <td className="px-4 py-2 text-[12px] font-semibold">
                                                                    {query.studentContact.phoneNumber}
                                                                </td>
                                                                <td className="px-4 py-2 text-[12px] font-semibold">
                                                                    {query.referenceid !== "null" &&
                                                                        query.referenceid !== null
                                                                        ? query.referenceid
                                                                        : "Not Provided"}
                                                                    {query.suboption !== "null" && <>{query.suboption}</>}
                                                                </td>
                                                                <td className="px-4 py-2 text-[12px] font-semibold">
                                                                    {query.studentContact.city}
                                                                </td>
                                                                <td className="px-4 py-2 text-[12px] font-semibold">
                                                                    {query.studentContact.address}
                                                                </td>
                                                                <td className="px-4 py-2 text-[12px] font-semibold">
                                                                    {query.assignedsenthistory &&
                                                                        query.assignedsenthistory.length > 0
                                                                        ? query.assignedsenthistory
                                                                            .map((id) => getUserName(id))
                                                                            .join(", ")
                                                                        : "Not Assigned"}
                                                                </td>
                                                                <td className="px-4 py-2 text-[12px] font-semibold">
                                                                    {query.assignedreceivedhistory &&
                                                                        query.assignedreceivedhistory.length > 0
                                                                        ? query.assignedreceivedhistory
                                                                            .map((id) => getUserName(id))
                                                                            .join(", ")
                                                                        : "Not Assigned"}
                                                                </td>
                                                                <td className="px-4 py-2 text-[12px] font-semibold">
                                                                    {new Date(query.createdAt).toLocaleDateString("en-GB", {
                                                                        day: "2-digit",
                                                                        month: "2-digit",
                                                                        year: "numeric",
                                                                    })}
                                                                </td>
                                                                <td className="px-4 py-2 text-[12px] font-semibold">
                                                                    <td className="px-4 py-2 text-[12px] font-semibold">
                                                                        {query.addmission ? "Enroll" : "Not Enroll"}
                                                                    </td>
                                                                </td>
                                                                <td className="px-4 py-2 text-[12px] font-semibold">
                                                                    {query.connectionStatus && query.connectionStatus.length > 0 ? (
                                                                        Object.entries(
                                                                            query.connectionStatus.reduce((acc, statusEntry) => {
                                                                                const statusLabel =
                                                                                    statusEntry.status === "no_connected" ? "No Connected" :
                                                                                        statusEntry.status === "not_lifting" ? "Not Lifting" :
                                                                                            statusEntry.status === "connected" ? "Connected" : "Unknown";

                                                                                if (!acc[statusLabel]) {
                                                                                    acc[statusLabel] = { count: 0, time: statusEntry.time, subStatus: {} };
                                                                                }

                                                                                acc[statusLabel].count++;

                                                                                if (statusEntry.subStatus) {
                                                                                    acc[statusLabel].subStatus[statusEntry.subStatus] =
                                                                                        (acc[statusLabel].subStatus[statusEntry.subStatus] || 0) + 1;
                                                                                }

                                                                                return acc;
                                                                            }, {})
                                                                        ).map(([status, data], index) => (
                                                                            <div key={index} className="flex flex-col">
                                                                                <span className="text-gray-700">{status} ({data.count})</span>
                                                                                {Object.entries(data.subStatus).map(([sub, count], subIndex) => (
                                                                                    <span key={subIndex} className="text-gray-500 ml-2">
                                                                                        {sub}: {count}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-gray-500">No Status</span>
                                                                    )}
                                                                </td>

                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ))
                    )}
                </div>
            </div>
        </>
    );
}

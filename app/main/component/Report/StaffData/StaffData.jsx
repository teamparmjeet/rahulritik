"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function StaffData({ staffid }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState([]);
    const [activeDay, setActiveDay] = useState(null);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [filteredDates, setFilteredDates] = useState([]);
    const [monthlyActivity, setMonthlyActivity] = useState(null);

    useEffect(() => {
        const fetchQueryData = async () => {
            if (staffid) {
                try {
                    setLoading(true);
                    const response = await axios.get(`/api/report/staffdata/${staffid}`);
                    setData(response.data.data.userActivityReport);
                } catch (error) {
                    console.error("Error fetching query data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchQueryData();
    }, [staffid]);

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
        if (selectedYear && selectedMonth && data.dailyActivity) {
            const filtered = Object.entries(data.dailyActivity).filter(([day]) => {
                const date = new Date(day);
                return (
                    date.getFullYear().toString() === selectedYear &&
                    (date.getMonth() + 1).toString() === selectedMonth
                );
            });
            setFilteredDates(filtered);

            // Extract monthly activity
            const monthKey = `${selectedYear}-${selectedMonth.padStart(2, "0")}`;
            if (data.monthlyActivity && data.monthlyActivity[monthKey]) {
                setMonthlyActivity(data.monthlyActivity[monthKey]);
            } else {
                setMonthlyActivity(null);
            }
        } else {
            setFilteredDates([]);
            setMonthlyActivity(null);
        }
    }, [selectedYear, selectedMonth, data.dailyActivity, data.monthlyActivity]);

    const getUserName = (id) => {
        const matchedUser = user.find((u) => u._id === id);
        return matchedUser ? matchedUser.name : "Unknown User";
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-100">
                <div className="text-3xl text-blue-500">Loading...</div>
            </div>
        );
    }

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

    return (
        <>
             <div className="text-xl font-bold text-center text-white bg-blue-600 py-4 rounded-t-xl shadow-md">
                Staff Report of <span className=" text-yellow-400"> {data.userName}</span> from <span className=" text-yellow-400">{data.branch}</span>
            </div>
            <div className="container lg:w-[95%] mx-auto py-5">
                {/* Dropdowns for year and month */}
                <div className="flex space-x-4 mb-6">
                    <select
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setSelectedMonth(""); // Reset month when year changes
                        }}
                        className="bg-gray-100 border border-gray-300 p-2 rounded"
                    >
                        <option value="">Select Year</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        disabled={!selectedYear}
                        className="bg-gray-100 border border-gray-300 p-2 rounded"
                    >
                        <option value="">Select Month</option>
                        {months.map((month) => (
                            <option key={month} value={month}>
                                {new Date(0, month - 1).toLocaleString("en", { month: "long" })}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mt-4 space-y-4">
                    {/* Display Monthly Activity */}
                    {monthlyActivity && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                            <h3 className="text-lg font-semibold mb-2 text-blue-800">Monthly Activity</h3>
                            <p className="text-gray-700">
                                Total Actions: <span className="font-bold">{monthlyActivity[0]}</span>
                            </p>
                            <p className="text-gray-700">
                                Total Other Metrics: <span className="font-bold">{monthlyActivity[1]}</span>
                            </p>
                        </div>
                    )}

                    {/* Display Daily Activity */}
                    {filteredDates.length === 0 ? (
                        <div>No daily activity data available.</div>
                    ) : (
                        filteredDates
                            .sort(([dayA], [dayB]) => new Date(dayB) - new Date(dayA))
                            .map(([day, activity]) => (
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
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {activity.queries.map((query, index) => (
                                                        <tr key={index}>
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
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))
                    )}
                </div>
            </div>
        </>
    );
}

"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Loader from "@/components/Loader/Loader";
import * as XLSX from "xlsx";
import Link from "next/link";
export default function MBSWise() {
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filters, setFilters] = useState({
        userName: "",
        branch: "",
        date: "",
    });
    const [columns, setColumns] = useState({
        userName: true,
        branch: true,
        dailyActivity: true,
        weeklyActivity: true,
        monthlyActivity: true,
        trendAnalysis: true,
    });


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get("/api/report/MBS/query");
                const reportData = response.data.data.userActivityReport || [];
                setData(reportData);
                setFilteredData(reportData);
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Failed to fetch data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const handleFilterChange = useCallback((e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    }, []);


    useEffect(() => {
        const filtered = data.map((user) => {
            const matchesUserName = filters.userName
                ? user.userName.toLowerCase().includes(filters.userName.toLowerCase())
                : true;
            const matchesBranch = filters.branch
                ? user.branch.toLowerCase().includes(filters.branch.toLowerCase())
                : true;


            const filteredDailyActivity = filters.date
                ? { [filters.date]: user.dailyActivity[filters.date] }
                : user.dailyActivity;

            const matchesDate = filters.date
                ? Object.keys(user.dailyActivity).includes(filters.date)
                : true;

            return matchesUserName && matchesBranch && matchesDate
                ? { ...user, dailyActivity: filteredDailyActivity }
                : null;
        }).filter(Boolean);

        setFilteredData(filtered);
    }, [filters, data]);


    const handleColumnChange = (e) => {
        const { name, checked } = e.target;
        setColumns((prev) => ({ ...prev, [name]: checked }));
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const exportToExcel = useCallback(() => {
        const selectedColumns = Object.keys(columns).filter((col) => columns[col]);
        const exportData = filteredData.map((user) => {
            const row = {};
            if (columns.userName) row["User Name"] = user.userName;
            if (columns.branch) row["Branch"] = user.branch;
            if (columns.dailyActivity)
                row["Daily Activity"] = JSON.stringify(user.dailyActivity);
            if (columns.weeklyActivity) row["Weekly Activity"] = user.weeklyActivity;
            if (columns.monthlyActivity)
                row["Monthly Activity"] = JSON.stringify(user.monthlyActivity);
            if (columns.trendAnalysis)
                row["Trend Analysis"] = JSON.stringify(user.trendAnalysis);
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");
        const fileName = `UserActivityReport_${new Date().toISOString()}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    }, [filteredData, columns]);

    // Loader display
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader />
            </div>
        );
    }

    // Render
    return (
        <div className="mt-12 container lg:w-[90%] mx-auto">


            <div className=" flex justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Staff Activity Reports
                    </h1>
                </div>
                <div className=" flex gap-2 items-center">
                    <button
                        onClick={toggleModal}
                        className=" px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Open Filters
                    </button>

                    <button
                        onClick={exportToExcel}
                        className=" px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Export to Excel
                    </button>

                </div>
            </div>


            {filteredData.map((user, index) => (
                <div key={index} className="p-6 border rounded-lg mb-6 shadow-lg bg-white">
                    {/* Report Header */}
                    <div className="border-b-4 border-blue-500 pb-4 mb-4">
                        <h2 className="text-2xl font-bold text-blue-800">User Report</h2>
                        <p className="text-gray-500 text-sm">
                            Generated on: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    {/* User Info Table */}
                    <table className="table-auto w-full border-collapse border border-gray-300 mb-6">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="border border-gray-300 p-3 text-left text-sm font-semibold text-blue-700">Category</th>
                                <th className="border border-gray-300 p-3 text-left text-sm font-semibold text-blue-700">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {columns.userName && (
                                <tr>
                                    <td className="border border-gray-300 p-3 font-medium">User Name</td>
                                    <td className="border border-gray-300 p-3">{user.userName}</td>
                                </tr>
                            )}
                            {columns.branch && (
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-300 p-3 font-medium">Branch</td>
                                    <td className="border border-gray-300 p-3">{user.branch}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Daily Activity */}
                    {columns.dailyActivity && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-blue-700 mb-2">Daily Activity Report</h3>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-blue-100">
                                        <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Date</th>
                                        <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Actions</th>
                                        <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Query IDs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(user.dailyActivity)
                                        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                                        .map(([date, { count, queries }], index) => {
                                            const formattedDate = new Date(date).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            });
                                            return (
                                                <tr key={date} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                    <td className="border border-gray-300 p-3">{formattedDate}</td>
                                                    <td className="border border-gray-300 p-3">{count[0]} actions</td>
                                                    <td className="border border-gray-300 p-3">
                                                        <ul className="flex flex-wrap gap-2">
                                                            {queries.map((queryId, index) => (
                                                                <li key={queryId}>
                                                                    <Link
                                                                        href={`/main/page/allquery/${queryId}`}
                                                                        className="bg-blue-100 px-3 py-1 rounded-full text-blue-700 text-xs font-medium hover:bg-blue-200 transition"
                                                                    >
                                                                        Query {index + 1}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Weekly Activity */}
                    {columns.weeklyActivity && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-blue-700">Weekly Activity</h3>
                            <p className="text-gray-600 mt-1">{user.weeklyActivity} Updates this week</p>
                        </div>
                    )}

                    {/* Monthly Activity */}
                    {columns.monthlyActivity && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-blue-700 mb-2">Monthly Activity</h3>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-blue-100">
                                        <th className="border border-gray-300 p-3">Month</th>
                                        <th className="border border-gray-300 p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(user.monthlyActivity)
                                        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                                        .map(([date, [actions]]) => {
                                            const formattedDate = new Date(date).toLocaleDateString("en-GB", {
                                                month: "long",
                                                year: "numeric",
                                            });
                                            return (
                                                <tr key={date}>
                                                    <td className="border border-gray-300 p-3">{formattedDate}</td>
                                                    <td className="border border-gray-300 p-3">{actions} actions</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Trend Analysis */}
                    {columns.trendAnalysis && user.trendAnalysis && (
                        <div>
                            <h3 className="text-lg font-semibold text-blue-700 mb-2">Trend Analysis</h3>
                            <table className="w-full border-collapse">
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-300 p-3 font-medium bg-blue-50">Current Week</td>
                                        <td className="border border-gray-300 p-3">{user.trendAnalysis.currentWeek}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-3 font-medium bg-blue-50">Last Week</td>
                                        <td className="border border-gray-300 p-3">{user.trendAnalysis.lastWeek}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-3 font-medium bg-blue-50">Change</td>
                                        <td
                                            className={`border border-gray-300 p-3 font-medium ${user.trendAnalysis.change > 0
                                                    ? "text-green-600"
                                                    : user.trendAnalysis.change < 0
                                                        ? "text-red-600"
                                                        : "text-gray-600"
                                                }`}
                                        >
                                            {user.trendAnalysis.change}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}



            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 text-center">Filter & Customize</h2>

                        {/* Filters */}
                        <div className="mb-6 grid grid-cols-1 gap-4">
                            <input
                                type="text"
                                name="userName"
                                placeholder="Filter by Staff Name"
                                value={filters.userName}
                                onChange={handleFilterChange}
                                className="p-2 border rounded"
                                aria-label="Filter by Staff Name"
                            />
                            <input
                                type="text"
                                name="branch"
                                placeholder="Filter by Branch"
                                value={filters.branch}
                                onChange={handleFilterChange}
                                className="p-2 border rounded"
                                aria-label="Filter by Branch"
                            />
                            <input
                                type="date"
                                name="date"
                                value={filters.date}
                                onChange={handleFilterChange}
                                className="p-2 border rounded"
                                aria-label="Filter by Date"
                            />
                        </div>

                        {/* Column Selection */}
                        <div className="mb-6 grid grid-cols-1 gap-4">
                            {Object.keys(columns).map((col) => (
                                <label key={col} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name={col}
                                        checked={columns[col]}
                                        onChange={handleColumnChange}
                                        className="form-checkbox"
                                    />
                                    <span className="text-gray-700 capitalize">{col.replace(/([A-Z])/g, " $1")}</span>
                                </label>
                            ))}
                        </div>

                        {/* Modal Actions */}
                        <div className="flex justify-end space-x-4">

                            <button
                                onClick={toggleModal}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div >
    );
}

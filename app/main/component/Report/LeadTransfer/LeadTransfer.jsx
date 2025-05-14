"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Loader from "@/components/Loader/Loader";
import * as XLSX from "xlsx";

export default function LeadTransfer() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [modalData, setModalData] = useState({ type: "", queryIds: [] });
    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get("/api/report/MBS2/query");
                const reportData = response.data.data.userActivityReport || [];
                setData(reportData);

            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Failed to fetch data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const openModal = (type, queryIds) => {
        setModalData({ type, queryIds });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalData({ type: "", queryIds: [] });
    };


    if (loading) {
        return (
            <div className="mt-12 container lg:w-[90%] mx-auto text-center">
                {/* Loading Spinner or Message */}
                <div className="flex justify-center items-center h-40">
                    <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin"></div>
                    <p className="ml-4 text-xl font-semibold text-gray-700">Loading...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="mt-12 container lg:w-[90%] mx-auto">
            <div className="text-3xl font-bold text-center text-white bg-blue-600 py-4 rounded-t-xl shadow-md">
                    Lead Activity Reports
                
            </div>


            <div className="p-4">
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2">User Name</th>
                            <th className="border border-gray-300 px-4 py-2">Branch</th>
                            <th className="border border-gray-300 px-4 py-2">Sent Queries</th>
                            <th className="border border-gray-300 px-4 py-2">Received Queries</th>
                            <th className="border border-gray-300 px-4 py-2">Sent Query</th>
                            <th className="border border-gray-300 px-4 py-2">Received Query</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2">{item.userName}</td>
                                <td className="border border-gray-300 px-4 py-2">{item.branch}</td>
                                <td className="border border-gray-300 px-4 py-2">{item.sentQueries}</td>
                                <td className="border border-gray-300 px-4 py-2">{item.receivedQueries}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        onClick={() =>
                                            openModal(
                                                "Sent Queries",
                                                item.sentQueryDetails
                                            )
                                        }
                                    >
                                        View ({item.sentQueryDetails.length})
                                    </button>
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                    <button
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                        onClick={() =>
                                            openModal(
                                                "Received Queries",
                                                item.receivedQueryDetails
                                            )
                                        }
                                    >
                                        View ({item.receivedQueryDetails.length})
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>


                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        {/* Background Overlay */}
                        <div
                            className="fixed inset-0 bg-black opacity-50"
                            onClick={closeModal}
                        ></div>


                        <div className="bg-white p-6 rounded shadow-lg z-10  max-h-[80vh] overflow-y-scroll">

                            <h3 className="text-xl font-semibold mb-4">{modalData.type}</h3>

                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">Assigned Date</th>
                                        <th className="px-4 py-2 text-left">Assigned By</th>
                                        <th className="px-4 py-2 text-left">Assigned To</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {modalData.queryIds.map((query, idx) => {
                                        const formattedDate = new Date(query.assignedDate).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        });

                                        return (
                                            <tr key={idx} className="border-t">
                                                <td className="px-4 py-2">{query.queryDetails.studentName}</td>
                                                <td className="px-4 py-2">{formattedDate}</td>
                                                <td className="px-4 py-2">{query.queryDetails.assignedsenthistory}</td>
                                                <td className="px-4 py-2">{query.queryDetails.assignedreceivedhistory}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Close Button */}
                            <button
                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

            </div>



        </div>
    )
}

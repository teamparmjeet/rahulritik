"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader/Loader';
import StaffReport from '@/components/StaffReport/StaffReport';
import StaffReport2 from '@/components/StaffReport2/StaffReport2';
import StaffReport3 from '@/components/StaffReport3/StaffReport3';
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";

export default function StaffReportdata({ staffid, staffName, staffBranch }) {
    const [allqueries, setAllqueries] = useState([]);
    const [sentqueries, setSentqueries] = useState([]);
    const [receivedqueries, setReceivedqueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [referenceId, setReferenceId] = useState("");
    const [suboption, setSuboption] = useState("");
    const [referenceData, setReferenceData] = useState([]);
    const [selectedReference, setSelectedReference] = useState(null);
    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

    useEffect(() => {
        const fetchQueryData = async () => {
            if (staffid) {
                try {
                    setLoading(true);
                    const response = await axios.get(`/api/report/staffquery/${staffid}`);
                    console.log("All Queries: ", response.data.fetch); // Log all queries
                    setAllqueries(response.data.fetch);
                    const response1 = await axios.get(`/api/report/staffsenquery/${staffid}`);
                    console.log("Sent Queries: ", response1.data.fetch); // Log sent queries
                    setSentqueries(response1.data.fetch);
                    const response2 = await axios.get(`/api/report/staffreceivedquery/${staffid}`);
                    console.log("Received Queries: ", response2.data.fetch); // Log received queries
                    setReceivedqueries(response2.data.fetch);
                } catch (error) {
                    console.error('Error fetching query data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchQueryData();
    }, [staffid]);

    const normalizeDate = (date) => {
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0); // Set time to 00:00:00.000 to ignore time part
        return normalizedDate;
    };

    const normalizeEndDate = (date) => {
        const normalizedDate = new Date(date);
        normalizedDate.setHours(23, 59, 59, 999); // Set time to 23:59:59.999 to include the whole end day
        return normalizedDate;
    };

    const filterByDateAndReference = (data) => {
        let filteredData = data;

        // Apply date filter if startDate or endDate is provided
        if (startDate || endDate) {
            filteredData = filteredData.filter(item => {
                const createdAt = new Date(item.createdAt); // The timestamp from MongoDB
                const start = normalizeDate(startDate);  // The normalized start date
                const end = normalizeEndDate(endDate);  // The normalized end date (to include the whole day)

                // Include the item if the createdAt date is between startDate and endDate (inclusive)
                return (
                    (startDate ? createdAt >= start : true) && // Include if after startDate (or no startDate)
                    (endDate ? createdAt <= end : true) // Include if before or on the last millisecond of endDate
                );
            });
        }

        // Apply reference filter if referenceId is provided
        if (referenceId) {
            filteredData = filteredData.filter(item => item.referenceid === referenceId);
        }

        // Apply suboption filter if "Online" reference and suboption is selected
        if (selectedReference?.referencename === "Online" && suboption) {
            filteredData = filteredData.filter(item => item.suboption === suboption);
        }

        return filteredData;
    };



    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const referenceResponse = await axios.get("/api/reference/fetchall/reference");
                setReferenceData(referenceResponse.data.fetch);
                console.log("Reference Data: ", referenceResponse.data.fetch); // Log reference data
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Error fetching data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleReferenceChange = (e) => {
        const selectedName = e.target.value;
        setReferenceId(selectedName);
        const reference = referenceData.find((data) => data.referencename === selectedName);
        setSelectedReference(reference || null);
    };

    // Reset all filters
    const resetFilters = () => {
        setReferenceId("");
        setSuboption("");
        setStartDate("");
        setEndDate("");
        setSelectedReference(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader />
            </div>
        );
    }

    return (
        <>
            <div ref={contentRef}>

                <div className="text-xl font-bold text-center text-white bg-blue-600 py-4 rounded-t-xl shadow-md">
                    Staff Report of <span className=' text-yellow-400'> {staffName}</span> at <span className=' text-yellow-400'> {staffBranch}</span> Branch
                </div>
                <button
                    onClick={() => reactToPrintFn()}
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-600"
                >
                    Print Page
                </button>
                <div className=' flex flex-wrap gap-5 justify-around'>
                    <div className="px-6 py-4 flex gap-4 justify-center items-center bg-gray-50 shadow-md rounded-lg mt-4">
                        <label className="font-semibold">Reference Filter</label>
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

                    <div className="px-6 py-4 flex gap-4 justify-center items-center bg-gray-50 shadow-md rounded-lg mt-4">
                        <label className="font-semibold">Start Date:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border p-2 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
                        />
                        <label className="font-semibold">End Date:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border p-2 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
                        />
                    </div>

                    {/* Reset Filter Button */}
                    <div className="flex items-center justify-center mt-4">
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                <div >

                    <div className="px-6 py-4 mt-6 bg-white shadow-md rounded-lg">
                        <h2 className="text-lg font-semibold mb-2 text-blue-600">Created Query</h2>
                        <StaffReport data={filterByDateAndReference(allqueries)} />
                    </div>

                    <div className="px-6 py-4 mt-4 bg-gray-100 shadow-md rounded-lg">
                        <h2 className="text-lg font-semibold mb-2 text-green-600">Assigned Sent</h2>
                        <StaffReport2 data={filterByDateAndReference(sentqueries)} />
                    </div>

                    <div className="px-6 py-4 mt-4 bg-gray-100 shadow-md rounded-lg">
                        <h2 className="text-lg font-semibold mb-2 text-red-600">Assigned Received</h2>
                        <StaffReport3 data={filterByDateAndReference(receivedqueries)} />
                    </div>
                </div>
            </div>
        </>
    );
}

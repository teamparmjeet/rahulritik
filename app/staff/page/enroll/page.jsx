"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader/Loader';
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';

export default function Assigned() {
    const [queries, setQueries] = useState([]);
    const [branchStats, setBranchStats] = useState({});
    const [cityStats, setCityStats] = useState({}); // New state for city statistics
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [adminId, setAdminId] = useState(null);
    const { data: session } = useSession();


    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6); // Items to show per page
    const router = useRouter();


    
    useEffect(() => {
        const fetchAdminData = async () => {
            if (session?.user?.email) {
                try {
                    const { data } = await axios.get(`/api/admin/find-admin-byemail/${session.user.email}`);
                    setAdminId(data._id);
                } catch (error) {
                    console.error(error.message);
                }
            }
        };
        fetchAdminData();
    }, [session]);


    // Fetch enrolled queries and branch statistics
    useEffect(() => {
        const fetchEnrolledQueries = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/queries/enrolledbyuser/${adminId}`);
                setQueries(response.data.fetch);
                calculateBranchStats(response.data.fetch); // Calculate stats based on the fetched data
                calculateCityStats(response.data.fetch); // Calculate city stats based on the fetched data
            } catch (error) {
                setError('Failed to fetch data. Please try again later.');
                console.error('Error fetching enrolled queries:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledQueries();
    }, [adminId]);

    // Calculate statistics per branch
    const calculateBranchStats = (data) => {
        const stats = data.reduce((acc, query) => {
            acc[query.branch] = (acc[query.branch] || 0) + 1;
            return acc;
        }, {});
        setBranchStats(stats);
    };

    // Calculate statistics per city
    const calculateCityStats = (data) => {
        const stats = data.reduce((acc, query) => {
            acc[query.studentContact.city] = (acc[query.studentContact.city] || 0) + 1;
            return acc;
        }, {});
        setCityStats(stats); // Update city stats
    };

    // Handle search input change
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    // Filter queries based on search term (name or contact number)
    const filteredQueries = queries.filter((query) =>
        query.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.studentContact.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.studentContact.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastQuery = currentPage * itemsPerPage;
    const indexOfFirstQuery = indexOfLastQuery - itemsPerPage;
    const currentQueries = filteredQueries.slice(indexOfFirstQuery, indexOfLastQuery);
    const totalPages = Math.ceil(filteredQueries.length / itemsPerPage);

    if (loading) {
        return <div><Loader /></div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    const handleRowClick = (id) => {
        router.push(`/staff/page/allquery/${id}`);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col lg:flex-row justify-between space-y-6 lg:space-y-0 lg:space-x-6">

                {/* Assigned Queries Table */}
                <div className="w-full lg:w-2/3">
                    <div className="shadow-lg rounded-lg bg-white mb-6 relative overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Enrolled Queries</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Total Students: <span className="font-bold">{filteredQueries.length}</span>
                            </p>
                            <div className="relative overflow-y-auto" style={{ height: '400px' }}>
                                <table className="min-w-full text-xs text-left text-gray-600 font-sans">
                                    <thead className="bg-[#29234b] text-white uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Sr. No.</th>
                                            <th className="px-6 py-4">Student Name</th>
                                            <th className="px-6 py-4">Branch</th>
                                            <th className="px-6 py-4">City</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center h-full">
                                                        <Loader />
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : currentQueries.length > 0 ? (
                                            currentQueries.map((query, index) => {
                                                const deadline = new Date(query.deadline);
                                                const isToday = deadline.toDateString() === new Date().toDateString();
                                                const isPastDeadline = deadline < new Date();
                                                const isIn24Hours =
                                                    deadline.toDateString() ===
                                                    new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
                                                const isIn48Hours =
                                                    deadline.toDateString() ===
                                                    new Date(Date.now() + 48 * 60 * 60 * 1000).toDateString();


                                                return (
                                                    <tr
                                                        key={query._id}
                                                        className={`border-b cursor-pointer transition-colors duration-200 hover:opacity-90`}
                                                        onClick={() => handleRowClick(query._id)}
                                                    >
                                                        <td className="px-6 py-1 font-semibold">{indexOfFirstQuery + index + 1}</td>
                                                        <td className="px-6 py-1 font-semibold">{query.studentName}</td>
                                                        <td className="px-6 py-1">{query.branch}</td>
                                                        <td className="px-6 py-1">
                                                            {query.studentContact.city}
                                                        </td>
                                                        <td className="px-6 py-1">
                                                            {query.addmission ? "Enroll" : "Pending"}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                    No queries available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded bg-blue-600 text-white transition duration-200 ease-in-out hover:bg-blue-500 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Previous
                        </button>
                        <span className="font-semibold">Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded bg-blue-600 text-white transition duration-200 ease-in-out hover:bg-blue-500 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Branch Statistics */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <div className="shadow-lg rounded-lg bg-white p-6">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Branch Statistics</h2>
                        <ul className="space-y-2 text-sm">
                            {Object.keys(branchStats).length > 0 ? (
                                Object.entries(branchStats).map(([branch, count], index) => (
                                    <li key={index} className="flex justify-between">
                                        <span>{branch}</span>
                                        <span className="font-bold">{count}</span>
                                    </li>
                                ))
                            ) : (
                                <li>No branch statistics available.</li>
                            )}
                        </ul>
                    </div>

                    {/* City Statistics */}
                    <div className="shadow-lg rounded-lg bg-white p-6">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">City Statistics</h2>
                        <ul className="space-y-2 text-sm">
                            {Object.keys(cityStats).length > 0 ? (
                                Object.entries(cityStats).map(([city, count], index) => (
                                    <li key={index} className="flex justify-between">
                                        <span>{city}</span>
                                        <span className="font-bold">{count}</span>
                                    </li>
                                ))
                            ) : (
                                <li>No city statistics available.</li>
                            )}
                        </ul>
                    </div>

                    {/* Search by Name/Contact */}
                    <div className="shadow-lg rounded-lg bg-white p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Search by Name , Contact Number or City</h3>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search by Name , Contact Number or City"
                            className="w-full px-3 border border-gray-300 rounded focus:outline-none focus:ring-1 transition duration-200 ease-in-out"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

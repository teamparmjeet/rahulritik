"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader/Loader';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function UnderVisit() {
    // Updated state variable for grade filtering
    const [selectedGrade, setSelectedGrade] = useState('Null');
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeadline, setSelectedDeadline] = useState('All');
    const [selectedEnrollStatus, setSelectedEnrollStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const { data: session } = useSession();
    const [adminData, setAdminData] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const router = useRouter();



    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await axios.get(`/api/admin/find-admin-byemail/${session?.user?.email}`);
                setAdminData(response.data._id); // Make sure response.data contains branch and _id
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.email) fetchAdminData();
    }, [session]);



    useEffect(() => {
        const fetchQueryData = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`/api/queries/fetchgrade-byuser/${adminData}`);
                setQueries(data.queries);
            } catch (error) {
                console.error('Error fetching query data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQueryData();
    }, [adminData]);

    const handleRowClick = (id) => {
        router.push(`/staff/page/allquery/${id}`);
    };
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };


    // Updated filter logic for grade
    const filteredQueries = queries.filter(query => {
        const matchesGrade = selectedGrade === 'Null' || query.grade === selectedGrade;
        const queryDeadline = new Date(query.deadline);

        const matchesDeadline = selectedDeadline === 'All' ||
            (selectedDeadline === 'Today' && queryDeadline.toDateString() === new Date().toDateString()) ||
            (selectedDeadline === 'Tomorrow' && queryDeadline.toDateString() === new Date(Date.now() + 86400000).toDateString()) ||
            (selectedDeadline === 'Past' && queryDeadline < new Date() && queryDeadline.toDateString() !== new Date().toDateString());

        const matchesEnrollStatus = selectedEnrollStatus === 'All' ||
            (selectedEnrollStatus === 'Enroll' && query.addmission) ||
            (selectedEnrollStatus === 'Pending' && !query.addmission);

        // Check if any of the student-related fields match the searchTerm
        const matchesSearchTerm =
            (query.studentName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (query.studentContact?.phoneNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (query.studentContact?.city?.toLowerCase() || "").includes(searchTerm.toLowerCase());

        // Combine all the conditions
        return matchesGrade && matchesDeadline && matchesEnrollStatus && matchesSearchTerm;
    });


    const sortedQueries = filteredQueries.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    // Pagination Logic
    const indexOfLastQuery = currentPage * itemsPerPage;
    const indexOfFirstQuery = indexOfLastQuery - itemsPerPage;
    const currentQueries = sortedQueries.slice(indexOfFirstQuery, indexOfLastQuery);
    const totalPages = Math.ceil(sortedQueries.length / itemsPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Define the grade options
    const gradeOptions = ['Null', 'A', 'B', 'C'];

    const enrolledCount = filteredQueries.filter(query => query.addmission).length;
    const pendingCount = filteredQueries.filter(query => !query.addmission).length;

    return (
        <div className="container mx-auto p-5">
            <div className="flex flex-col lg:flex-row justify-between space-y-6 lg:space-y-0 lg:space-x-6">
                {/* Queries List */}
                <div className="w-full lg:w-2/3">
                    <div className="shadow-lg rounded-lg bg-white mb-6 relative">
                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Grade Count</h2>
                            <div className="flex gap-4 space-x-4 text-sm text-gray-600 mb-4">
                                <p>Total Requests: <span className="font-bold">{filteredQueries.length}</span></p>
                                <p>Enrolled: <span className="font-bold">{enrolledCount}</span></p>
                                <p>Pending: <span className="font-bold">{pendingCount}</span></p>
                            </div>
                            <div className="relative overflow-y-auto" style={{ height: '400px' }}>
                                <table className="min-w-full text-xs text-left text-gray-600 font-sans">
                                    <thead className="bg-[#29234b] text-white uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Sr. No.</th>
                                            <th className="px-6 py-4">Student Name</th>
                                            <th className="px-6 py-4">Grade</th>
                                            <th className="px-6 py-4">Deadline</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center h-full">
                                                        <Loader />
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : currentQueries.length > 0 ? (
                                            currentQueries
                                                .sort((a, b) => {
                                                    const gradeOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'F': 5 };
                                                    return gradeOrder[a.grade] - gradeOrder[b.grade];
                                                })
                                                .map((query, index) => {
                                                    const deadline = new Date(query.deadline);
                                                    const isToday = deadline.toDateString() === new Date().toDateString();
                                                    const isPastDeadline = deadline < new Date();
                                                    const isIn24Hours = deadline.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
                                                    const isIn48Hours = deadline.toDateString() === new Date(Date.now() + 48 * 60 * 60 * 1000).toDateString();

                                                    // Define the row class based on conditions
                                                    const rowClass = query.addmission
                                                        ? 'bg-[#6cb049] text-white'
                                                        : query.grade === 'A'
                                                            ? 'bg-yellow-400 text-black'
                                                            : query.grade === 'B'
                                                                ? 'bg-blue-800 text-white'
                                                                : query.grade === 'C'
                                                                    ? 'bg-blue-500 text-white'
                                                                    : isToday
                                                                        ? 'bg-red-500 text-white'
                                                                        : isPastDeadline
                                                                            ? 'bg-gray-800 text-white animate-blink'
                                                                            : isIn24Hours
                                                                                ? 'bg-[#fcccba] text-black'
                                                                                : isIn48Hours
                                                                                    ? 'bg-[#ffe9bf] text-black'
                                                                                    : '';

                                                    return (
                                                        <tr
                                                            key={query._id}
                                                            className={`border-b cursor-pointer transition-colors duration-200 hover:opacity-90 ${rowClass}`}
                                                            onClick={() => handleRowClick(query._id)}
                                                        >
                                                            <td className="px-6 py-1 font-semibold">{indexOfFirstQuery + index + 1}</td>
                                                            <td className="px-6 py-1 font-semibold">{query.studentName}</td>
                                                            <td className="px-6 py-1">{query.grade}</td>
                                                            <td className="px-6 py-1">{deadline.toLocaleDateString()}</td>
                                                            <td className="px-6 py-1">{query.addmission ? 'Enroll' : 'Pending'}</td>
                                                        </tr>
                                                    );
                                                })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                    No queries available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>


                            {/* Pagination Controls */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gray-100 py-2 px-4 flex justify-between">
                                <span className="self-center text-xs">Total Queries: {filteredQueries.length}</span>
                                <button
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-xs"
                                    onClick={() => handlePageChange('prev')}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <span className="self-center text-xs">Page {currentPage} of {totalPages}</span>
                                <button
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-xs"
                                    onClick={() => handlePageChange('next')}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="w-full lg:w-1/3 space-y-6">
                    {/* Grade Filter */}
                    <div className="shadow-lg rounded-lg bg-white p-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Filter by Grade</h3>
                        <div className="space-y-2">
                            {gradeOptions.map((grade) => (
                                <button
                                    key={grade}
                                    onClick={() => setSelectedGrade(grade)}
                                    className={`w-full py-2 px-4 text-left rounded flex justify-between items-center ${selectedGrade === grade ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                >
                                    <span>
                                        {grade === 'Null' ? 'All' : grade === 'A' ? 'Grade A (Student will visit in 1–2 days)' : grade === 'B' ? 'Grade B (Student will visit in 3–7 days)' : grade === 'C' ? 'Grade C (Student will visit beyond 7 days)' : grade}
                                    </span>

                                    <span className="ml-2 text-gray-500">
                                        {selectedGrade === grade ? '-' : '+'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Deadline Filter */}
                    <div className="shadow-lg rounded-lg bg-white p-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Filter by Deadline</h3>
                        <select
                            className="w-full py-2 px-3 bg-gray-100 rounded"
                            value={selectedDeadline}
                            onChange={(e) => setSelectedDeadline(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Today">Today</option>
                            <option value="Tomorrow">Tomorrow</option>
                            <option value="Past">Past</option>
                        </select>
                    </div>

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

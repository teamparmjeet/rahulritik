"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader/Loader';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Assigned() {
    const [queries, setQueries] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adminId, setAdminId] = useState(null);
    const [adminBranch, setAdminBranch] = useState(null);
    const { data: session } = useSession();
    const router = useRouter();
    const [user, setuser] = useState([]);

    // Filter states
    const [selectedBranch, setSelectedBranch] = useState('All');
    const [selectedDeadline, setSelectedDeadline] = useState('All');
    const [selectedEnrollStatus, setSelectedEnrollStatus] = useState('All');
    const [openBranchDetails, setOpenBranchDetails] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const fetchuserData = async () => {
            try {
                const response = await axios.get('/api/admin/fetchall/admin');
                setuser(response.data.fetch);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchuserData();
    }, []);
    const handleAcceptQuery = async () => {
        if (!selectedQuery) return;

        try {
            const data = { id: selectedQuery._id, assignedTo: adminId, assignedTostatus: false, branch: adminBranch };
            const response = await axios.patch('/api/queries/update', data);

            if (response.status === 200) {
                alert('Query status updated successfully');
                setShowPopup(false);
                setSelectedQuery(null);
                // Optionally: Refresh data or update state here
            }
        } catch (error) {
            console.error('Error updating query status:', error);
            alert('Failed to update query status');
        }
    };
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchAdminData = async () => {
            if (session?.user?.email) {
                try {
                    const { data } = await axios.get(`/api/admin/find-admin-byemail/${session.user.email}`);
                    setAdminId(data._id);
                    setAdminBranch(data.branch)
                } catch (error) {
                    console.error(error.message);
                }
            }
        };
        fetchAdminData();
    }, [session]);

    useEffect(() => {
        const fetchBranchData = async () => {
            try {
                const response = await axios.get('/api/branch/fetchall/branch');
                setBranches(response.data.fetch);
            } catch (error) {
                console.error('Error fetching branch data:', error);
            }
        };
        fetchBranchData();
    }, []);

    useEffect(() => {
        const fetchQueryData = async () => {
            if (adminId) {
                try {
                    setLoading(true);
                    const { data } = await axios.get(`/api/queries/assignedreq/${adminId}?autoclosed=open`);
                    setQueries(data.fetch);
                } catch (error) {
                    console.error('Error fetching query data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchQueryData();
    }, [adminId]);

    const handleRowClick = (id) => {
        router.push(`/staff/page/allquery/${id}`);
    };

    const branchDetails = branches.reduce((acc, branch) => {
        const branchQueries = queries.filter(query => query.lastbranch === branch.branch_name);
        acc[branch.branch_name] = {
            count: branchQueries.length,
            Enrolls: branchQueries.filter(query => query.addmission).length,
            pending: branchQueries.filter(query => !query.addmission).length,
        };
        return acc;
    }, {});

    const totalRequests = Object.values(branchDetails).reduce((acc, { count }) => acc + count, 0);

    const resetFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setSelectedBranch('All');
        setSelectedDeadline('All');
        setSelectedEnrollStatus('All');
    };

    const filteredQueries = queries
        .filter(query => {
            const matchesBranch = selectedBranch === 'All' || query.lastbranch === selectedBranch;
            const queryDeadline = new Date(query.deadline);
            const queryAssignedDate = new Date(query.assigneddate);

            const matchesDeadline = selectedDeadline === 'All' ||
                (selectedDeadline === 'Today' && queryDeadline.toDateString() === new Date().toDateString()) ||
                (selectedDeadline === 'Tomorrow' && queryDeadline.toDateString() === new Date(Date.now() + 86400000).toDateString()) ||
                (selectedDeadline === 'Past' && queryDeadline < new Date() && queryDeadline.toDateString() !== new Date().toDateString());

            const matchesEnrollStatus = selectedEnrollStatus === 'All' ||
                (selectedEnrollStatus === 'Enroll' && query.addmission) ||
                (selectedEnrollStatus === 'Pending' && !query.addmission);

            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            // Ensure the end date includes the entire day (not just 00:00 time)
            if (end) {
                end.setHours(23, 59, 59, 999);
            }

            const matchesDateRange =
                (!start || (queryAssignedDate && queryAssignedDate >= start)) &&
                (!end || (queryAssignedDate && queryAssignedDate <= end));

            return matchesBranch && matchesDeadline && matchesEnrollStatus && matchesDateRange;
        })
        .sort((a, b) => {
            const deadlineA = new Date(a.deadline);
            const deadlineB = new Date(b.deadline);

            const isInvalidA = isNaN(deadlineA);
            const isInvalidB = isNaN(deadlineB);

            // Sort valid deadlines before invalid deadlines
            if (isInvalidA && !isInvalidB) return 1;
            if (!isInvalidA && isInvalidB) return -1;

            // If both are valid, sort by deadline date (earliest first)
            if (!isInvalidA && !isInvalidB) return deadlineA - deadlineB;

            // If both are invalid, maintain their original order
            return 0;
        });



    const toggleBranchDetails = (branchName) => {
        setOpenBranchDetails(prev => (prev === branchName ? null : branchName));
        setSelectedBranch(prev => (prev === branchName ? 'All' : branchName));
    };

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

    return (
        <div className="container mx-auto p-5">
            <div className="flex flex-col lg:flex-row justify-between space-y-6 lg:space-y-0 lg:space-x-6">
                {/* Queries List */}
                <div className="w-full lg:w-2/3">
                    <div className="shadow-lg rounded-lg bg-white mb-6 relative">
                        <div className="p-4">

                            <div className=' flex justify-between'>

                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Assigned Request</h2>
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-end bg-gray-50">
                                    <div className="w-full md:w-auto">
                                        <label
                                            htmlFor="startDate"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                                            value={startDate || ''}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-auto">
                                        <label
                                            htmlFor="endDate"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                                            value={endDate || ''}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        className="w-full md:w-auto mt-2 md:mt-0 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all"
                                        onClick={() => {
                                            const now = new Date();
                                            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                                            // Format dates as YYYY-MM-DD
                                            const formatDate = (date) => {
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                return `${year}-${month}-${day}`;
                                            };

                                            setStartDate(formatDate(firstDayOfMonth));
                                            setEndDate(formatDate(now));
                                        }}
                                    >
                                        This Month
                                    </button>

                                    <button
                                        className="w-full md:w-auto mt-2 md:mt-0 px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all"
                                        onClick={resetFilters}
                                    >
                                        Reset Filters
                                    </button>
                                </div>

                            </div>
                            <p className="text-sm text-gray-600 mb-4">Total Requests: <span className="font-bold">{totalRequests}</span></p>
                            <div className="relative overflow-y-auto" style={{ height: '500px' }}>
                                <table className="min-w-full text-xs text-left text-gray-600 font-sans">
                                    <thead className="bg-[#29234b] text-white uppercase">
                                        <tr>
                                            <th className="px-1 py-4">SN.</th>
                                            <th className="px-1 py-4">Student Name</th>
                                            <th className="px-1 py-4">Contact No</th>
                                            <th className="px-1 py-4">Assigned Date</th>
                                            <th className="px-1 py-4">Assigned From</th>
                                            <th className="px-1 py-4">Deadline</th>
                                            <th className="px-1 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="px-2 py-4  text-center">
                                                    <div className="flex items-center justify-center h-full">
                                                        <Loader />
                                                    </div>
                                                </td>
                                            </tr>



                                        ) : currentQueries.length > 0 ? (
                                            currentQueries
                                                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)) // Sort by deadline
                                                .map((query, index) => {

                                                    const deadline = new Date(query.deadline);
                                                    const assigneddate = new Date(query.assigneddate);
                                                    const isToday = deadline.toDateString() === new Date().toDateString();
                                                    const isPastDeadline = deadline < new Date();
                                                    const isIn24Hours = deadline.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
                                                    const isIn48Hours = deadline.toDateString() === new Date(Date.now() + 48 * 60 * 60 * 1000).toDateString();

                                                    // Define the row class based on conditions
                                                    const rowClass = query.addmission
                                                        ? 'bg-[#6cb049] text-white'
                                                        : isToday ? 'bg-red-500 text-white'
                                                            : isPastDeadline ? 'bg-gray-800 text-white animate-blink'  // Changed bg color for visibility
                                                                : isIn24Hours ? 'bg-[#fcccba] text-black'
                                                                    : isIn48Hours ? 'bg-[#ffe9bf] text-black'
                                                                        : '';
                                                    const matchedUser = user.find((u) => u._id == query.assignedsenthistory);
                                                    return (
                                                        <tr
                                                            key={query._id}
                                                            className={`border-b cursor-pointer transition-colors duration-200 hover:opacity-90 ${rowClass}`}
                                                            onClick={() => handleRowClick(query._id)}
                                                        >
                                                            <td className="px-2 py-1 font-semibold">{(indexOfFirstQuery + index + 1)}</td>
                                                            <td className="px-2 py-1 font-semibold">{query.studentName}</td>
                                                            <td className="px-2 py-1 font-semibold">{query.studentContact.phoneNumber}</td>
                                                            <td className="px-2 py-1">{assigneddate.toLocaleDateString()}</td>
                                                            <td className="px-2 py-1">
                                                                {matchedUser
                                                                    ? `${matchedUser.name} (${matchedUser.branch}) Branch`
                                                                    : "User not found"}
                                                            </td>
                                                            <td className="px-2 py-1">{deadline.toLocaleDateString()}</td>
                                                            <td
                                                                className="px-2 py-1 text-blue-500 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (query.assignedTostatus) {
                                                                        setSelectedQuery(query);
                                                                        setShowPopup(true);
                                                                    }
                                                                }}
                                                            >
                                                                {query.assignedTostatus ? 'Pending' : 'Accepted'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-2 py-4 text-center text-gray-500">
                                                    No queries available
                                                </td>
                                            </tr>
                                        )}
                                        {showPopup && (
                                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                                <div className="bg-white rounded-lg p-6 text-center">
                                                    <h2 className="text-lg font-semibold mb-4">Accept Query</h2>
                                                    <p>Are you sure you want to accept this query?</p>
                                                    <div className="mt-4 flex justify-center space-x-4">
                                                        <button
                                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                                            onClick={handleAcceptQuery}
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                                            onClick={() => setShowPopup(false)}
                                                        >
                                                            Ignore
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </tbody>


                                </table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gray-100 py-2 px-4 flex justify-between">
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
                    {/* Branch Filter */}
                    <div className="shadow-lg rounded-lg bg-white p-4">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Branch Statistics</h2>
                        <h2 className=" bg-gray-800 mb-4 p-1 text-white">
                            Total Queries Received = {filteredQueries.length}
                        </h2>
                        <ul className="space-y-2 text-sm">
                            {branches.map(branch => {
                                // Filter the queries for the specific branch based on the date filter
                                const filteredBranchQueries = filteredQueries.filter(
                                    query => query.lastbranch === branch.branch_name
                                );

                                // Calculate total count of Enrolls and Pending for this branch
                                const totalCount = filteredBranchQueries.reduce(
                                    (acc, query) => {
                                        if (query.addmission) acc.Enrolls += 1;
                                        else acc.pending += 1;
                                        return acc;
                                    },
                                    { Enrolls: 0, pending: 0 }
                                );

                                return (
                                    <li key={branch._id}>
                                        <button
                                            onClick={() => toggleBranchDetails(branch.branch_name)}
                                            className={`w-full py-2 px-4 text-left rounded flex justify-between items-center ${selectedBranch === branch.branch_name ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-100'}`}
                                        >
                                            {/* Show branch name with total count in parentheses */}
                                            <span>
                                                {branch.branch_name} ({totalCount.Enrolls + totalCount.pending})
                                            </span>
                                            <span className="ml-2 text-gray-500">
                                                {selectedBranch === branch.branch_name ? '-' : '+'}
                                            </span>
                                        </button>

                                        {openBranchDetails === branch.branch_name && (
                                            <div className="pl-4 py-2 bg-gray-100 rounded mt-2 space-y-2 transition-all duration-300 ease-in-out">
                                                <p className="text-gray-700">
                                                    Enrolls: <span className="font-semibold">{totalCount.Enrolls}</span>
                                                </p>
                                                <p className="text-gray-700">
                                                    Visited: <span className="font-semibold">{totalCount.Enrolls}</span>
                                                </p>
                                                <p className="text-gray-700">
                                                    Pending: <span className="font-semibold">{totalCount.pending}</span>
                                                </p>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader/Loader';
import { useRouter } from 'next/navigation';
import StaffReportdata from '../StaffReportdata/StaffReportdata';
import { ArrowLeft, ArrowRight, Search, Trash2, CirclePlus, Filter, X } from "lucide-react";
import Link from 'next/link';

export default function StaffReport() {
    const [user, setuser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [userPerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [filteruser, setfilteruser] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState("");
    const [selectedName, setSelectedName] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");
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

    const router = useRouter();

    const toggleFilterPopup = () => {
        setIsFilterOpen(!isFilterOpen);
    };
    const handleRowClick = (email, name, branch) => {
        setSelectedEmail(email); // Set the selected email
        setSelectedName(name);
        setSelectedBranch(branch)
        setIsModalOpen(true); // Open the modal
    };

    const closeModal = () => {
        setIsModalOpen(false); // Close the modal
        setSelectedEmail(""); // Clear the selected email
        setSelectedName("");
        setSelectedBranch("")
    };
    // Sort user based on selected order
    const sortuser = (user) => {
        return user.sort((a, b) => {
            return sortOrder === "newest"
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt);
        });
    };

    const filtereduser = sortuser(
        user.filter(user =>
            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(user.mobile).includes(searchTerm)) && // Ensure mobile is treated as a string
            (filteruser === "" || user.branch.includes(filteruser)) &&
            (filterStatus === "" || user.usertype.includes(filterStatus))
        )
    );







    return (
        <>
            <div className="text-xl inline font-extrabold text-center sticky top-0 py-2 px-4 backdrop-blur-md bg-blue-100/80 rounded-br-full   text-blue-800 ">
                Staff Register
            </div>
            <div className='container lg:w-[95%] mx-auto py-5'>
                {/* Search, Sort, Filter, and Bulk Actions */}
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-1/3">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search size={14} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search By  Name or Phone Number"
                            className="border px-3 py-2 pl-10 text-sm focus:outline-none  w-full  "
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className="lg:hidden text-gray-600 px-3 py-2 border rounded-md" onClick={toggleFilterPopup}>
                        <Filter size={16} />
                    </button>

                    {/* Popup for Filters on Mobile */}
                    {isFilterOpen && (
                        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50">
                            <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg p-4 z-50">
                                <button className="text-gray-600 mb-4" onClick={toggleFilterPopup}>
                                    <X size={20} />
                                </button>

                                <div className="flex flex-col space-y-3">
                                    <select
                                        className="border px-3 py-2 focus:outline-none text-sm"
                                        value={filteruser}
                                        onChange={(e) => setfilteruser(e.target.value)}
                                    >
                                        <option value="">All Branch</option>
                                        {Array.from(new Set(user.flatMap(user => user.branch))).map((branch, index) => (
                                            <option key={index} value={branch}>{branch}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="border px-3 py-2 focus:outline-none text-sm"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="">All User</option>
                                        <option value="0">User</option>
                                        <option value="1">Branch Admin</option>
                                        <option value="2">Tifa Admin</option>
                                    </select>

                                    <select
                                        className="border px-3 py-2 focus:outline-none text-sm"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="oldest">Oldest</option>
                                    </select>

                                    <Link href={'/main/page/adduser'}>
                                        <button className="bg-[#29234b] rounded-md flex items-center text-white text-sm px-4 py-2">
                                            <CirclePlus size={16} className='me-1' /> Add user
                                        </button>
                                    </Link>


                                </div>
                            </div>
                        </div>
                    )}

                    {/* Desktop Filter Section */}
                    <div className="hidden lg:flex space-x-3">
                        <select
                            className="border px-3 py-2 focus:outline-none text-sm"
                            value={filteruser}
                            onChange={(e) => setfilteruser(e.target.value)}
                        >
                            <option value="">All Branch</option>
                            {Array.from(new Set(user.flatMap(user => user.branch))).map((branch, index) => (
                                <option key={index} value={branch}>{branch}</option>
                            ))}
                        </select>

                        <select
                            className="border px-3 py-2 focus:outline-none text-sm"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All User</option>
                            <option value="0">User</option>
                            <option value="1">Branch Admin</option>

                        </select>


                        <select
                            className="border px-3 py-2 focus:outline-none text-sm"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                        </select>


                    </div>
                </div>

                {/* user Table */}
                <div className="relative overflow-x-auto shadow-md  bg-white   border border-gray-200">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-600 font-sans">
                        <thead className="bg-[#29234b] text-white uppercase">
                            <tr>

                                <th scope="col" className="px-4 font-medium capitalize py-2">User Name</th>
                                <th scope="col" className="px-4 font-medium capitalize py-2">Email</th>
                                <th scope="col" className="px-4 font-medium capitalize py-2">Mobile</th>
                                <th scope="col" className="px-4 font-medium capitalize py-2">Branch</th>
                                <th scope="col" className="px-4 font-medium capitalize py-2">Roll</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4">
                                        <div className="flex justify-center items-center h-[300px]">
                                            <Loader />
                                        </div>
                                    </td>
                                </tr>
                            ) : filtereduser.length > 0 ? (
                                filtereduser
                                    .filter(user => user.usertype !== "2") // Filter out users with usertype "2"
                                    .map((user, index) => (
                                        <tr
                                            key={user._id}
                                            onClick={() => handleRowClick(user._id, user.name, user.branch)}
                                            className={`border-b cursor-pointer hover:bg-gray-100 odd:bg-gray-50 even:bg-gray-100 transition-colors duration-200`}
                                        >
                                            <td
                                                className="px-4 py-2 font-semibold text-gray-900 text-sm whitespace-nowrap"

                                            >
                                                {user.name}
                                            </td>
                                            <td className="px-4 py-2 text-[12px]">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-2 truncate text-[12px]">
                                                {user.mobile}
                                            </td>
                                            <td className="px-4 py-2 text-[12px]">
                                                {user.branch}
                                            </td>
                                            <td className={`px-4 py-2 text-[12px] rounded-lg transition-all duration-300 ease-in-out shadow-md 
                    ${user.usertype === "0" ? 'bg-yellow-500 ' :
                                                    user.usertype === "1" ? 'bg-[#6cb049] ' :
                                                        'bg-gray-100 '}`}>
                                                {user.usertype === "0" && <span className="text-white font-semibold font-sans">Staff</span>}
                                                {user.usertype === "1" && <span className="text-white font-semibold font-sans">Branch Admin</span>}
                                                {user.usertype !== "0" && user.usertype !== "1" && (
                                                    <span className="text-gray-500 font-semibold">Unknown User Type</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No users available
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>

                </div>


                {isModalOpen && (
                    <div className="fixed bg-white inset-0 z-50 flex items-center justify-center  overflow-auto">
                        <div className="   h-screen w-screen  relative">
                            <button
                                className="absolute top-0 text-3xl bg-red-200 hover:bg-red-600 rounded-bl-full w-16 flex justify-center items-center  right-0 border text-white"
                                onClick={closeModal}
                            >
                                &times;
                            </button>
                            <div>  <StaffReportdata staffid={selectedEmail} staffName={selectedName} staffBranch={selectedBranch} onClose={closeModal} /></div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader/Loader';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Search, Trash2, CirclePlus, Filter, X } from "lucide-react";
import Link from 'next/link';

export default function Branch() {
    const [branches, setBranches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [branchesPerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [sortOrder, setSortOrder] = useState("newest");
    const [filterCourse, setFilterCourse] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch branches data
                const branchesResponse = await axios.get('/api/branch/fetchall/branch');
                setBranches(branchesResponse.data.fetch);

                // Fetch courses data
                const coursesResponse = await axios.get('/api/course/fetchall/ds');
                setCourses(coursesResponse.data.fetch);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const router = useRouter();
    const handleRowClick = (id) => {
        router.push(`/main/page/branch/${id}`);
    };

    const toggleFilterPopup = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    // Sort branches based on selected order
    const sortBranches = (branches) => {
        return branches.sort((a, b) => {
            return sortOrder === "newest"
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt);
        });
    };

    // Filter branches based on course and search term
    const filteredBranches = sortBranches(
        branches.filter(branch =>
            branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterCourse === "" || branch.courses.includes(filterCourse))
        )
    );

    // Pagination logic
    const indexOfLastBranch = currentPage * branchesPerPage;
    const indexOfFirstBranch = indexOfLastBranch - branchesPerPage;
    const currentBranches = filteredBranches.slice(indexOfFirstBranch, indexOfLastBranch);
    const totalPages = Math.ceil(filteredBranches.length / branchesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle multi-select for bulk actions
    const handleSelectBranch = (id) => {
        if (selectedBranches.includes(id)) {
            setSelectedBranches(selectedBranches.filter(branchId => branchId !== id));
        } else {
            setSelectedBranches([...selectedBranches, id]);
        }
    };

    // Function to get course name by course ID
    const getCourseName = (courseId) => {
        const course = courses.find(course => course._id === courseId);
        return course ? course.course_name : 'No course found';
    };

    return (
        <div className='container lg:w-[95%] mx-auto py-5'>
            {/* Search, Sort, Filter, and Bulk Actions */}
            <div className="flex justify-between items-center mb-4">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search size={14} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search branch"
                        className="border px-3 py-2 pl-10 text-sm focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filter buttons for desktop */}
                <div className="hidden lg:flex space-x-3">
                    <select
                        className="border px-3 py-2 focus:outline-none text-sm"
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                    >
                        <option value="">All Courses</option>
                        {Array.from(new Set(courses.map(course => course.course_name))).map((courseName, index) => (
                            <option key={index} value={courseName}>{courseName}</option>
                        ))}
                    </select>

                    <select
                        className="border px-3 py-2 focus:outline-none text-sm"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>

                    <Link href={'/main/page/addbranch'}>
                        <button className="bg-[#29234b] rounded-md flex items-center text-white text-sm px-4 py-2">
                            <CirclePlus size={16} className='me-1' /> Add Branch
                        </button>
                    </Link>
                </div>
            </div>

            {/* Branch Table */}
            <div className="relative overflow-x-auto shadow-md bg-white border border-gray-200">
                <table className="w-full text-sm text-left rtl:text-right text-gray-600 font-sans">
                    <thead className="bg-[#29234b] text-white uppercase">
                        <tr>
                            <th scope="col" className="px-4 font-medium capitalize py-2">Branch Name</th>
                            <th scope="col" className="px-4 font-medium capitalize py-2">Location</th>
                            <th scope="col" className="px-4 font-medium capitalize py-2">Courses Offered</th>
                            <th scope="col" className="px-4 font-medium capitalize py-2">Student Count</th>
                            <th scope="col" className="px-4 font-medium capitalize py-2">Staff Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4">
                                    <div className="flex justify-center items-center h-[300px]">
                                        <Loader />
                                    </div>
                                </td>
                            </tr>
                        ) : currentBranches.length > 0 ? (
                            currentBranches.map((branch, index) => (
                                <tr
                                    key={branch._id}
                                    onClick={() => handleRowClick(branch._id)}
                                    className="border-b cursor-pointer hover:bg-gray-100 odd:bg-gray-50 even:bg-gray-100 transition-colors duration-200"
                                >
                                    <td className="px-4 py-2 font-semibold text-gray-900 text-sm whitespace-nowrap">
                                        {branch.branch_name}
                                    </td>
                                    <td className="px-4 py-2 text-[12px]">
                                        {branch.location.street}, {branch.location.city}, {branch.location.state}, {branch.location.zipCode}
                                    </td>
                                    {/* <td className="px-4 py-2  text-[12px]">
                                        {branch.courses.length > 0 ? getCourseName(branch.courses[0]) : 'No courses'}
                                    </td> */}

                                    <td className="px-4 py-2 text-[12px]">
                                        {branch.courses.length > 0 
                                            ? branch.courses.map((courseId, index) => {
                                                const course = courses.find(course => course._id === courseId);
                                                return (
                                                    <span key={courseId}>
                                                        {course ? course.course_name : 'Unknown course'}
                                                        {index < branch.courses.length - 1 && ', '}
                                                    </span>
                                                );
                                            })
                                            : 'No courses'}
                                    </td>
                                    <td className="px-4 py-2 text-[12px]">{branch.student_count}</td>
                                    <td className="px-4 py-2 text-[12px]">{branch.staff_count}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No branches available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    paginate={paginate}
                />
            </div>
        </div>
    );
}

// Pagination component remains the same
const Pagination = ({ currentPage, totalPages, paginate }) => {
    return (
        <div className="flex justify-center my-4">
            <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 mx-1 text-sm border rounded ${currentPage === 1 ? 'cursor-not-allowed bg-gray-200' : 'bg-[#6cb049] text-white'}`}
            >
                <ArrowLeft size={18} />
            </button>

            <span className="px-3 py-1 mx-1 text-sm border rounded bg-gray-200">
                Page {currentPage} of {totalPages}
            </span>

            <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 mx-1 text-sm border rounded ${currentPage === totalPages ? 'cursor-not-allowed bg-gray-200' : 'bg-[#6cb049] text-white'}`}
            >
                <ArrowRight size={18} />
            </button>
        </div>
    );
};

"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/Loader/Loader";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { ChevronDownSquare } from "lucide-react"
import { useSession } from "next-auth/react";

export default function Visit() {
    const [queries, setQueries] = useState([]);
    const [filteredQueries, setFilteredQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();

    const [filters, setFilters] = useState({
        branch: "",
        studentName: "",
        contact: "",
        course: "",
        assignedTo: "",
        city: "",
    });
    const [courses, setCourses] = useState({});
    const [coursesfee, setCoursesfee] = useState({});
    const [user, setUser] = useState({});
    const router = useRouter();
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [adminData, setAdminData] = useState(null);

    const [suboption, setSuboption] = useState("");
    const [referenceId, setReferenceId] = useState("");
    const [referenceData, setReferenceData] = useState([]);
    const [selectedReference, setSelectedReference] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {

                const referenceResponse = await axios.get("/api/reference/fetchall/reference");
                setReferenceData(referenceResponse.data.fetch);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Error fetching data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchAdminData = async () => {
            if (!session?.user?.email) return;

            setLoading(true);
            try {
                const response = await axios.get(`/api/admin/find-admin-byemail/${session.user.email}`);
                setAdminData(response.data.branch);
            } catch (err) {
                console.error("Error fetching admin data:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [session]);


    useEffect(() => {
        const fetchQueryData = async () => {
            if (!adminData) return;
            try {
                setLoading(true);
                const response = await axios.get(`/api/branchreport/enroll/${adminData}`);
                setQueries(response.data.fetch);
                setFilteredQueries(response.data.fetch);
            } catch (error) {
                console.error("Error fetching query data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQueryData();
    }, [adminData]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(`/api/course/fetchall/courses`);
                const courseMapping = response.data.fetch.reduce((acc, course) => {
                    acc[course._id] = course.course_name;
                    return acc;
                }, {});
                setCourses(courseMapping);

                const coursesfeeMapping = response.data.fetch.reduce((acc, coursesfee) => {
                    const enrollPercent = parseFloat(coursesfee.enrollpercent) || 0;
                    const enrollmentFee = coursesfee.fees * (enrollPercent / 100);

                    acc[coursesfee._id] = {
                        totalFee: coursesfee.fees,
                        enrollPercent: enrollPercent,
                        enrollmentFee: enrollmentFee.toFixed(),
                    };
                    return acc;
                }, {});

                setCoursesfee(coursesfeeMapping);
            } catch (error) {
                console.error("Error fetching courses:", error.message);
            }
        };

        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/api/admin/fetchall/admin');
                const userMapping = response.data.fetch.reduce((acc, user) => {
                    acc[user._id] = user.name;
                    return acc;
                }, {});
                setUser(userMapping);
            } catch (error) {
                console.error("Error fetching user:", error.message);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const filtered = queries.filter((query) => {
            const courseFeeDetails = coursesfee[query.courseInterest] || {};
            const remainingFees = courseFeeDetails.totalFee - query.total;

            const referenceName = query.referenceid || "Unknown Reference";
            const referenceSuboption = query.suboption || "";
            const admissionDate = query.addmissiondate ? new Date(query.addmissiondate) : null;
            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;


            const isWithinDateRange =
                (!from || (admissionDate && admissionDate >= from)) &&
                (!to || (admissionDate && admissionDate <= new Date(to.setHours(23, 59, 59, 999))));


            const actualFinalFees =
                query.finalfees && query.finalfees > 0
                    ? parseFloat(query.finalfees)
                    : parseFloat(courseFeeDetails.totalFee || 0);

            const finalFeesFilter = filters.finalfees ? parseFloat(filters.finalfees) : null;

            return (
                (!filters.branch || query.branch.toLowerCase().includes(filters.branch.toLowerCase())) &&
                (!filters.staffName || query.staffName.toLowerCase().includes(filters.staffName.toLowerCase())) &&
                (!filters.studentName || query.studentName?.toLowerCase().includes(filters.studentName.toLowerCase())) &&
                (!filters.contact || query.studentContact.phoneNumber.includes(filters.contact)) &&
                (!filters.course || (courses[query.courseInterest] || "").toLowerCase().includes(filters.course.toLowerCase())) &&
                (!filters.assignedTo || (user[query.assignedTo] || user[query.userid] || "").toLowerCase().includes(filters.assignedTo.toLowerCase())) &&
                (!filters.city || query.studentContact.city.toLowerCase().includes(filters.city.toLowerCase())) &&
                (!filters.fees || remainingFees.toString().includes(filters.fees)) &&
                (!finalFeesFilter || actualFinalFees === finalFeesFilter) &&
                (referenceId ? referenceName === referenceId : true) &&
                (suboption ? referenceSuboption === suboption : true) &&
                isWithinDateRange
            );
        });

        setFilteredQueries(filtered);
    }, [filters, queries, courses, user, coursesfee, fromDate, toDate, referenceId, suboption]);





    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleRowClick = (id) => {
        router.push(`/branch/page/allquery/${id}`);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredQueries);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Queries");
        XLSX.writeFile(workbook, "queries.xlsx");
    };
    const handleReferenceChange = (e) => {
        const selectedName = e.target.value;
        setReferenceId(selectedName);
        const reference = referenceData.find((data) => data.referencename === selectedName);
        setSelectedReference(reference || null);
    };
    
    const removeFilter = () => {
        setFilters({
            studentName: "",
            phoneNumber: "",
            courseInterest: "",
            assignedTo: "",
            staffName: "",
            branch: "",
            city: "",
            enroll: "",
        });
        setFromDate(null);
        setToDate(null);
        setReferenceId(null);
        setSuboption(null);
    };

    return (
        <>
            <div className="text-3xl font-bold text-center text-white bg-blue-600 py-4 rounded-t-xl shadow-md">
                Admission Report
            </div>
            <div className="container mx-auto p-5">
                <div className="flex flex-col lg:flex-row justify-between space-y-6 lg:space-y-0 lg:space-x-6">
                    <div className="w-full">
                        <h1 className="text-lg font-semibold mb-4">Total Queries: {filteredQueries.length}</h1>
                        <div className="shadow-lg rounded-lg bg-white mb-6">

                            <div className="p-4">
                                <button
                                    onClick={removeFilter}
                                    className="mb-4 bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition duration-200"
                                >
                                    Remove Filters
                                </button>
                                <div className="relative overflow-y-auto">
                                    <table className="min-w-full text-xs text-left text-gray-600 font-sans">
                                        <thead className="bg-[#29234b] text-white uppercase">
                                            <tr>
                                                <th className="px-6 py-4">S/N</th>

                                                <th className="px-6 py-4">

                                                    <input
                                                        type="text"
                                                        className="w-full mt-1 text-black px-2 py-1 rounded"
                                                        placeholder="Staff Name"
                                                        onChange={(e) =>
                                                            handleFilterChange("staffName", e.target.value)
                                                        }
                                                    />
                                                </th>
                                                <th className="px-6 py-4">

                                                    <input
                                                        type="text"
                                                        placeholder=" Student Name"
                                                        className="mt-1 w-full text-black text-sm border rounded px-2 py-1"
                                                        onChange={(e) => handleFilterChange("studentName", e.target.value)}
                                                    />
                                                </th>
                                                <th className="px-6 py-4">

                                                    <input
                                                        type="text"
                                                        placeholder="Contact No"
                                                        className="mt-1 w-full text-black text-sm border rounded px-2 py-1"
                                                        onChange={(e) => handleFilterChange("contact", e.target.value)}
                                                    />
                                                </th>
                                                <th className="px-6 py-4">

                                                    <input
                                                        type="text"
                                                        placeholder=" Interested Course"
                                                        className="mt-1 w-full text-black text-sm border rounded px-2 py-1"
                                                        onChange={(e) => handleFilterChange("course", e.target.value)}
                                                    />
                                                </th>
                                                <th className="px-4 py-3 text-[12px]">Reference
                                                    <select
                                                        value={referenceId}
                                                        onChange={handleReferenceChange}
                                                        className=" w-5 ms-2  text-gray-800  border focus:ring-0 focus:outline-none"
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
                                                            className=" w-5 ms-2  text-gray-800  border focus:ring-0 focus:outline-none"
                                                        >
                                                            <option value="">All</option>
                                                            {selectedReference.suboptions.map((suboption, index) => (
                                                                <option key={index} value={suboption.name}>
                                                                    {suboption.name}
                                                                </option>
                                                            ))}
                                                        </select>

                                                    )}
                                                </th>
                                                <th className="px-6 py-4">

                                                    <input
                                                        type="text"
                                                        placeholder="Assigned To"
                                                        className="mt-1 w-full text-black text-sm border rounded px-2 py-1"
                                                        onChange={(e) => handleFilterChange("assignedTo", e.target.value)}
                                                    />
                                                </th>
                                                <th className="px-6 py-4">

                                                    <input
                                                        type="text"
                                                        placeholder="Branch"
                                                        className="mt-1 w-full text-black text-sm border rounded px-2 py-1"
                                                        onChange={(e) => handleFilterChange("branch", e.target.value)}
                                                    />
                                                </th>
                                                <th className="px-6 py-4">

                                                    <input
                                                        type="text"
                                                        placeholder="City"
                                                        className="mt-1 w-full text-black text-sm border rounded px-2 py-1"
                                                        onChange={(e) => handleFilterChange("city", e.target.value)}
                                                    />
                                                </th>
                                                <th className="px-4 py-3 text-[12px] relative group flex">Admission Date <ChevronDownSquare className=" ms-2" />
                                                    <div className=" absolute bg-white p-2 hidden group-hover:block">

                                                        <div>

                                                            <input
                                                                type="date"
                                                                value={fromDate}
                                                                onChange={(e) => setFromDate(e.target.value)}
                                                                className=" text-gray-800  border focus:ring-0 focus:outline-none"
                                                            />
                                                        </div>
                                                        <p className=" text-black text-center">To</p>
                                                        <div>

                                                            <input
                                                                type="date"
                                                                value={toDate}
                                                                onChange={(e) => setToDate(e.target.value)}
                                                                className=" text-gray-800  border focus:ring-0 focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4">Total Fees</th>
                                                <th className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        placeholder="Final Fees"
                                                        className="mt-1 w-full text-black text-sm border rounded px-2 py-1"
                                                        onChange={(e) => handleFilterChange("finalfees", e.target.value)}
                                                    />
                                                </th>

                                                <th className="px-6 py-4">

                                                    <input
                                                        type="text"
                                                        placeholder="Remaining Fees"
                                                        className="mt-1 w-full text-black text-sm border rounded px-2 py-1"
                                                        onChange={(e) => handleFilterChange("fees", e.target.value)}
                                                    />
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="9" className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center h-full">
                                                            <Loader />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : filteredQueries.length > 0 ? (
                                                filteredQueries
                                                    .sort((a, b) => {
                                                        // Check if the dates exist and compare
                                                        const dateA = a.addmissiondate ? new Date(a.addmissiondate) : null;
                                                        const dateB = b.addmissiondate ? new Date(b.addmissiondate) : null;

                                                        if (dateA && dateB) {
                                                            return dateB - dateA; // Sort by most recent date first
                                                        }
                                                        if (!dateA && dateB) {
                                                            return 1; // Move N/A dates to the bottom
                                                        }
                                                        if (dateA && !dateB) {
                                                            return -1; // Move rows with dates to the top
                                                        }
                                                        return 0; // Keep order if both are N/A
                                                    })
                                                    .map((query, index) => {
                                                        const courseName = courses[query.courseInterest] || "Unknown Course";
                                                        const coursesfeen = coursesfee[query.courseInterest] || "N/A";
                                                        const UserName = user[query.assignedTo] || user[query.userid] || "Unknown User";
                                                        return (
                                                            <tr
                                                                key={query._id}
                                                                className="border-b cursor-pointer transition-colors duration-200 hover:opacity-90"
                                                                onClick={() => handleRowClick(query._id)}
                                                            >
                                                                <td className="px-6 py-1 font-semibold">{index + 1}</td>
                                                                <td className="px-6 py-1 font-semibold">{query.staffName}</td>
                                                                <td className="px-6 py-1 font-semibold">{query.studentName}</td>
                                                                <td className="px-6 py-1 font-semibold">{query.studentContact.phoneNumber}</td>
                                                                <td className="px-6 py-1 font-semibold">{courseName}</td>
                                                                <td className="px-6 py-1">{query.referenceid} {query.suboption !== "null" && <>{query.suboption}</>}</td>
                                                                <td className="px-6 py-1 font-semibold">{UserName}</td>
                                                                <td className="px-6 py-1">{query.branch}</td>
                                                                <td className="px-6 py-1">{query.studentContact.city}</td>
                                                                <td className="px-6 py-1">
                                                                    {query.addmissiondate
                                                                        ? new Intl.DateTimeFormat('en-GB', {
                                                                            day: 'numeric',
                                                                            month: 'long',
                                                                            year: 'numeric',
                                                                        }).format(new Date(query.addmissiondate))
                                                                        : 'N/A'}
                                                                </td>

                                                                <td className="px-6 py-1">{coursesfeen.totalFee ? `${coursesfeen.totalFee} ₹` : "N/A"}</td>
                                                                <td className="px-6 py-1">
                                                                    {query.finalfees > 0 ? (
                                                                        query.finalfees
                                                                    ) : (
                                                                        <>
                                                                            {coursesfeen.totalFee ? `${coursesfeen.totalFee} ₹` : "N/A"}
                                                                        </>
                                                                    )}
                                                                </td>

                                                                <td className="px-6 py-1">{coursesfeen.totalFee - query.total} ₹</td>
                                                            </tr>
                                                        );
                                                    })
                                            ) : (
                                                <tr>
                                                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                                                        No queries available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>

                                    </table>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

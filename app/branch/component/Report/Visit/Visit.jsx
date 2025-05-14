import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/Loader/Loader";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronDownSquare } from "lucide-react"

export default function Visit() {
  const [queries, setQueries] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [adminData, setAdminData] = useState(null);
  const [filters, setFilters] = useState({
    studentName: "",
    phoneNumber: "",
    courseInterest: "",
    branch: "",
    city: "",
    enroll: "",
  });
  const [courses, setCourses] = useState({});
  const [coursesfee, setCoursesfee] = useState({});
  const [user, setUser] = useState({});
  const [fromDate, setFromDate] = useState(""); // Added fromDate state
  const [toDate, setToDate] = useState(""); // Added toDate state
  const router = useRouter();

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

      setLoading(true);
      try {
        const { data } = await axios.get(`/api/report/visit/${adminData}`);
        setQueries(data.queries);
      } catch (error) {
        console.error("Error fetching query data:", error.message);
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
          // Parse enrollpercent as a number and calculate the enrollment fee
          const enrollPercent = parseFloat(coursesfee.enrollpercent) || 0; // Default to 0 if enrollpercent is invalid
          const enrollmentFee = coursesfee.fees * (enrollPercent / 100); // Calculate the enrollment fee

          acc[coursesfee._id] = {
            totalFee: coursesfee.fees,
            enrollPercent: enrollPercent,
            enrollmentFee: enrollmentFee.toFixed() // Keep the fee to two decimal places
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
    const fetchuserData = async () => {
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

    fetchuserData();
  }, []);


  useEffect(() => {
    const filtered = queries.filter((query) => {
      const courseName = courses[query.courseInterest] || "Unknown Course";
      const UserName = user[query.assignedTo] || "Unknown User";
      const referenceName = query.referenceid || "Unknown Reference";
      const referenceSuboption = query.suboption || "";
      // Convert transitionDate ('DD-MM-YYYY' ➝ 'YYYY-MM-DD' ➝ Date object)
      const visitedDate = query.transitionDate
        ? new Date(query.transitionDate.split('-').reverse().join('-'))
        : null;

      // Convert fromDate and toDate to Date objects (YYYY-MM-DD)
      const fromDateObj = fromDate ? new Date(fromDate) : null;
      const toDateObj = toDate ? new Date(toDate) : null;
      
      if (fromDateObj) {
          fromDateObj.setHours(0, 0, 0, 0); // Ensures fromDate starts at beginning of the day
      }
      

      // Filter based on date range
      const isWithinDateRange =
        (!fromDateObj || visitedDate >= fromDateObj) &&
        (!toDateObj || visitedDate <= toDateObj);

      return (
        isWithinDateRange &&
        (filters.studentName
          ? query.studentName?.toLowerCase().includes(filters.studentName.toLowerCase())
          : true) &&
        (filters.phoneNumber
          ? query.studentContact.phoneNumber.includes(filters.phoneNumber)
          : true) &&
        (filters.courseInterest
          ? courseName.toLowerCase().includes(filters.courseInterest.toLowerCase())
          : true) &&
        (filters.assignedTo
          ? UserName.toLowerCase().includes(filters.assignedTo.toLowerCase())
          : true) &&
        (filters.adminName
          ? query.adminName.toLowerCase().includes(filters.adminName.toLowerCase())
          : true) &&
        (filters.branch
          ? query.branch.toLowerCase().includes(filters.branch.toLowerCase())
          : true) &&
        (filters.city
          ? query.studentContact.city.toLowerCase().includes(filters.city.toLowerCase())
          : true) &&
        (filters.enroll
          ? (filters.enroll === "Enroll" && query.addmission) ||
          (filters.enroll === "Not Enroll" && !query.addmission)
          : true) &&
        (referenceId ? referenceName === referenceId : true) &&
        (suboption ? referenceSuboption === suboption : true)
      );
    });

    // Sort by transitionDate (latest first)
    const sortedQueries = filtered.sort((a, b) => {
      const dateA = a.transitionDate
        ? new Date(a.transitionDate.split('-').reverse().join('-'))
        : new Date(0);
      const dateB = b.transitionDate
        ? new Date(b.transitionDate.split('-').reverse().join('-'))
        : new Date(0);
      return dateB - dateA; // Latest dates first
    });

    setFilteredQueries(sortedQueries);
  }, [filters, queries, fromDate, toDate, referenceId, suboption]);


  const handleRowClick = (id) => {
    router.push(`/branch/page/allquery/${id}`);
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReferenceChange = (e) => {
    const selectedName = e.target.value;
    setReferenceId(selectedName);
    const reference = referenceData.find((data) => data.referencename === selectedName);
    setSelectedReference(reference || null);
  };

  return (
    <>
      <div className="text-3xl font-bold text-center text-white bg-blue-600 py-4 rounded-t-xl shadow-md">
        Visit Report
      </div>
      <div className="container mx-auto p-5">
        <div className="flex flex-col lg:flex-row justify-between space-y-6 lg:space-y-0 lg:space-x-6">
          <div className="w-full">
            Total Queries: {filteredQueries.length}
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
                              handleFilterChange("adminName", e.target.value)
                            }
                          />
                        </th>
                        <th className="px-6 py-4">

                          <input
                            type="text"
                            className="w-full mt-1 text-black px-2 py-1 rounded"
                            placeholder="Student Name"
                            onChange={(e) =>
                              handleFilterChange("studentName", e.target.value)
                            }
                          />
                        </th>
                        <th className="px-6 py-4">

                          <input
                            type="text"
                            className="w-full mt-1 text-black px-2 py-1 rounded"
                            placeholder=" Mobile No."
                            onChange={(e) =>
                              handleFilterChange("phoneNumber", e.target.value)
                            }
                          />
                        </th>
                        <th className="px-6 py-4">

                          <input
                            type="text"
                            className="w-full mt-1 text-black px-2 py-1 rounded"
                            placeholder=" Interested Course"
                            onChange={(e) =>
                              handleFilterChange("courseInterest", e.target.value)
                            }
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
                            className="w-full mt-1 text-black px-2 py-1 rounded"
                            placeholder="Assigned To"
                            onChange={(e) =>
                              handleFilterChange("assignedTo", e.target.value)
                            }
                          />
                        </th>
                        <th className="px-6 py-4">

                          <input
                            type="text"
                            className="w-full mt-1 text-black px-2 py-1 rounded"
                            placeholder="Branch"
                            onChange={(e) =>
                              handleFilterChange("branch", e.target.value)
                            }
                          />
                        </th>

                        <th className="px-6 py-4">

                          <input
                            type="text"
                            className="w-full mt-1 text-black px-2 py-1 rounded"
                            placeholder="City"
                            onChange={(e) =>
                              handleFilterChange("city", e.target.value)
                            }
                          />
                        </th>

                        <th className="px-4 py-3 text-[12px] relative group flex">Visited Date <ChevronDownSquare className=" ms-2" />
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


                        <th className="px-6 py-4">

                          <select
                            className="w-full mt-1 text-black px-2 py-1 rounded"
                            onChange={(e) =>
                              handleFilterChange("enroll", e.target.value)
                            }
                          >
                            <option value="">All</option>
                            <option value="Enroll">Enroll</option>
                            <option value="Not Enroll">Not Enroll</option>
                          </select>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center h-full">
                              <Loader />
                            </div>
                          </td>
                        </tr>
                      ) : filteredQueries.length > 0 ? (
                        filteredQueries.map((query, index) => {
                          const deadline = new Date(query.deadline);
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
                              <td className="px-6 py-1 font-semibold">{query.adminName}</td>
                              <td className="px-6 py-1 font-semibold">{query.studentName}</td>
                              <td className="px-6 py-1 font-semibold">{query.studentContact.phoneNumber}</td>
                              <td className="px-6 py-1 font-semibold">{courseName}</td>
                              <td className="px-6 py-1">{query.referenceid} {query.suboption !== "null" && <>{query.suboption}</>}</td>
                              <td className="px-6 py-1 font-semibold">{UserName}</td>
                              <td className="px-6 py-1">{query.branch}</td>
                              <td className="px-6 py-1">{query.studentContact.city}</td>
                              <td className="px-6 py-1">
                                {query.transitionDate}
                              </td>

                              <td className="px-6 py-1">
                                {query.addmission ? "Enroll" : "Not Enroll"}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
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

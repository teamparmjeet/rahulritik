"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/Loader/Loader";
import { useSession } from 'next-auth/react';
import Link from "next/link";

import { ChevronDownSquare } from "lucide-react";
export default function QueryReport() {
  const [allquery, setAllquery] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [referenceId, setReferenceId] = useState("");
  const [suboption, setSuboption] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [admission, setAdmission] = useState("");
  const [reson, setReson] = useState("");
  const [grade, setGrade] = useState("");
  const [reason, setReason] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [assignedName, setAssignedName] = useState("");
  const [assignedFrom, setAssignedFrom] = useState("");
  const [userName, setUserName] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [referenceData, setReferenceData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [user, setuser] = useState([]);
  const [selectedReference, setSelectedReference] = useState(null);
  const { data: session } = useSession();
  const [branch, setBranch] = useState("");
  const [showClosed, setShowClosed] = useState(false);
  const [adminData, setAdminData] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await axios.get("/api/admin/fetchall/admin");
        setuser(userResponse.data.fetch);
        const branchesResponse = await axios.get("/api/branch/fetchall/branch");
        setBranches(branchesResponse.data.fetch);
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
      try {
        const response = await axios.get(`/api/admin/find-admin-byemail/${session?.user?.email}`);
        setAdminData(response.data.branch); // Make sure response.data contains branch and _id
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) fetchAdminData();
  }, [session]);

  const fetchFilteredData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/branchreport/fetchalloverview/query", {
        params: {
          referenceId,
          suboption,
          fromDate,
          toDate,
          admission,
          grade,
          reason,
          location,
          city,
          assignedName,
          assignedFrom,
          userName,
          showClosed,
          adminData,
          studentName
        },
      });
      setAllquery(response.data.fetch);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data whenever filters change
  useEffect(() => {
    if (adminData) {  // Ensure adminData is available before fetching
      fetchFilteredData();
    }
  }, [referenceId, studentName, adminData, suboption, fromDate, toDate, admission, grade, reason, location, city, assignedName, assignedFrom, userName, showClosed]);

  const handleFilter = () => {
    fetchFilteredData();
  };

  const removeFilter = () => {
    // Reset all filter variables to their default values
    setReferenceId("");
    setSuboption("");
    setFromDate("");
    setToDate("");
    setAdmission("");
    setReson("");
    setGrade("");
    setReason("");
    setLocation("");
    setCity("");
    setAssignedName("");
    setAssignedFrom("");
    setUserName("");
    setStudentName("");
  };



  const getFilterSummary = () => {
    const filters = [];
    if (referenceId) filters.push(`Reference: ${referenceId}`);
    if (suboption) filters.push(`Suboption: ${suboption}`);
    if (fromDate) filters.push(`From Date: ${fromDate}`);
    if (toDate) filters.push(`To Date: ${toDate}`);
    if (admission) filters.push(`Admission: ${admission === "true" ? "Enroll" : "Not Enroll"}`);
    if (grade) filters.push(`Grade: ${grade}`);
    if (reason) filters.push(`Reason: ${reason}`);
    if (location) filters.push(`Branch: ${location}`);
    if (city) filters.push(`City: ${city}`);
    if (assignedName) filters.push(`Assigned To: ${assignedName}`);
    if (assignedFrom) filters.push(`Assigned From: ${assignedFrom}`);
    if (studentName) filters.push(`StudentName : ${studentName}`);
    if (userName) filters.push(`Creater Name: ${userName}`);
    if (showClosed) filters.push(`Closed Queries`);
    return filters.length > 0 ? filters.join(" | ") : "No filters applied.";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }



  const handleReferenceChange = (e) => {
    const selectedName = e.target.value;
    setReferenceId(selectedName);
    const reference = referenceData.find((data) => data.referencename === selectedName);
    setSelectedReference(reference || null);
  };
  return (
    <>
      <div className="text-3xl font-bold text-center text-white bg-blue-600 py-4 rounded-t-xl shadow-md">
        Over-View
      </div>
      <div className="mt-8 container lg:w-[98%] mx-auto">

        Total Queries: {allquery.length}
        <div className="flex justify-between gap-5 items-center">
          <div className="py-3 px-4 flex-auto mb-4 bg-blue-100 text-blue-800 rounded-lg shadow-md flex justify-between items-center">
            <span className="text-sm font-medium">{getFilterSummary()}</span>

          </div>
          <div>
            {/* 
            <button
              onClick={handleFilter}
              className="mb-4 bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition duration-200"
            >
              Apply Filters
            </button> */}
            <button
              onClick={removeFilter}
              className="mb-4 bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition duration-200"
            >
              Remove Filters
            </button>
          </div>

        </div>
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={showClosed === "close"}
              onChange={() => setShowClosed(showClosed === "close" ? "" : "close")}
              className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            Show Only Closed Queries
          </label>
        </div>

        <div className="  shadow-lg rounded-lg border border-gray-300">
          <table className="min-w-full text-left text-[12px] font-light border-collapse">
            <thead className="bg-gray-800 text-white">
              <tr className="divide-x divide-gray-700">
                <th className="px-4 py-3 text-[12px]">S/N</th>
                <th className="px-4 py-3 text-[12px]">Staff Name
                  <select
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-5 ms-2  text-gray-800  border focus:ring-0 focus:outline-none"
                  >
                    <option value="">All</option>
                    {user.map((data) => (
                      <option key={data._id} value={data.name}>
                        {data.name}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-4 py-3 text-[12px]">
                Student Name
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="nullCheck"
                      className="mr-2"
                      onChange={(e) => setStudentName("Null")}
                    />
                    <label htmlFor="nullCheck" className="text-[12px]">Null</label>
                  </div>
                </th>
                <th className="px-4 py-3 text-[12px]">Phone No.</th>
                <th className="px-4 py-3 text-[12px]">Contacts</th>
                <th className="px-4 py-3 text-[12px] ">Reference
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
                <th className="px-4 py-3 text-[12px]">Message</th>
                <th className="px-4 py-3 text-[12px]">City
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className=" w-5 ms-2  text-gray-800  border focus:ring-0 focus:outline-none"
                  >
                    <option value="">All</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="out">Out Of Jaipur</option>
                    <option value="Not_Provided">Not Provided</option>

                  </select>
                </th>
                <th className="px-4 py-3 text-[12px]">Grade
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-5 ms-2  text-gray-800  border focus:ring-0 focus:outline-none"
                  >
                    <option value="">All</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </th>
                <th className="px-4 py-3 text-[12px]">Assigned From
                  <select
                    value={assignedFrom}
                    onChange={(e) => setAssignedFrom(e.target.value)}
                    className="w-5 ms-2  text-gray-800  border focus:ring-0 focus:outline-none"
                  >
                    <option value="">All</option>
                    <option value="Not-Assigned">Not Assigned</option>
                    {user.map((data) => (
                      <option key={data._id} value={data.name}>
                        {data.name}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="px-4 py-3 text-[12px]">Assigned To
                  <select
                    value={assignedName}
                    onChange={(e) => setAssignedName(e.target.value)}
                    className="w-5 ms-2  text-gray-800  border focus:ring-0 focus:outline-none"
                  >
                    <option value="">All</option>
                    <option value="Not-Assigned">Not Assigned</option>
                    {user.map((data) => (
                      <option key={data._id} value={data.name}>
                        {data.name}
                      </option>
                    ))}
                  </select>
                </th>

                <th className="px-4 py-3 text-[12px] relative group flex">Created Date <ChevronDownSquare className=" ms-2" />
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

                {showClosed === "close" ? (
                  <>
                    <th className="px-4 py-3 text-[12px]">Reson
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-5 ms-2  text-gray-800  border focus:ring-0 focus:outline-none"
                      >
                        <option value="">All</option>
                        <option value="interested_but_not_proper_response">interested_but_not_proper_response</option>
                        <option value="no_connected">no_connected</option>
                        <option value="not_lifting">not_lifting</option>
                        <option value="busy">busy</option>
                        <option value="not_interested">not_interested</option>
                        <option value="wrong_no">wrong_no</option>
                        <option value="no_visit_branch_yet">no_visit_branch_yet</option>
                      </select>
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-[12px]">Stage</th>
                  </>
                )}

                <th className="px-4 py-3 text-[12px]">Enroll
                  <select
                    value={admission}
                    onChange={(e) => setAdmission(e.target.value)}
                    className="w-5 ms-2  text-gray-800  border focus:ring-0 focus:outline-none"
                  >
                    <option value="">All</option>
                    <option value="true">Enroll</option>
                    <option value="false">Not Enroll</option>
                  </select>
                </th>

              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allquery.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((data, index) => (

                  <tr
                    key={index}
                    className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    <td className="px-4 py-3 text-[12px]">{index + 1}</td>
                    <td className="px-4 py-3 text-[12px]">{data.userid}</td>
                    <td className="px-4 py-3 text-[12px] text-blue-500"> <Link href={`/branch/page/allquery/${data._id}`}>{data.studentName}</Link></td>
                    <td className="px-4 py-3 text-[12px]">{data.studentContact.phoneNumber}</td>
                    <td className="px-4 py-3 text-[12px]"> {data.historyCount}</td>
                    <td className="px-4 py-3 text-[12px]">{data.referenceid} {data.suboption}</td>
                    <td className="px-4 py-3 text-[12px] relative">
                      <span className="overflow-hidden whitespace-nowrap text-ellipsis">{data.lastmessage?.slice(0, 12)}...</span>
                      <div className="absolute cursor-pointer left-0 bottom-0 bg-gray-800 text-white p-2 rounded-md opacity-0 transition-opacity hover:opacity-100 max-w-xs w-48">
                        {data.lastmessage}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px]">{data.studentContact.city}</td>
                    <td className="px-4 py-3 text-[12px]">{data.lastgrade}</td>
                    <td className="px-4 py-3 text-[12px]">{data.assignedsenthistory}</td>
                    <td className="px-4 py-3 text-[12px]">{data.assignedreceivedhistory}</td>
                    <td className="px-4 py-3 text-[12px]">
                      {(() => {
                        const date = new Date(data.createdAt);
                        const monthNames = [
                          'January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'
                        ];
                        const day = date.getDate().toString().padStart(2, '0');
                        const month = monthNames[date.getMonth()];
                        const year = date.getFullYear();
                        return ` ${day} ${month}, ${year}`;
                      })()}
                    </td>

                    {showClosed === "close" ? (
                      <>
                        <td className="px-4 py-3 text-[12px] relative">
                          <span className="overflow-hidden whitespace-nowrap text-ellipsis">{data.reason?.slice(0, 12) || "N/A"}</span>
                          <div className="absolute cursor-pointer left-0 bottom-0 bg-gray-800 text-white p-2 rounded-md opacity-0 transition-opacity hover:opacity-100 max-w-xs w-48">
                            {data.reason || "N/A"}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>

                        <td className="px-4 py-3 text-[12px]">
                          {data.stage === 1
                            ? "1st Stage"
                            : data.stage === 2
                              ? "2nd Stage"
                              : data.stage === 3
                                ? "3rd Stage"
                                : data.stage === 4
                                  ? "4th Stage"
                                  : data.stage === 5
                                    ? "5th Stage"
                                    : data.stage === 6
                                      ? "6th Stage"
                                      : "Initial Stage"}
                        </td>
                      </>
                    )}

                    <td className="px-4 py-3 text-[12px]">{data.addmission ? "Enrolled" : "Not Enrolled"}</td>

                  </tr>

                ))}
            </tbody>
          </table>
        </div >
      </div>


    </>
  );
}

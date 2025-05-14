"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Loader from "@/components/Loader/Loader";
import { useSession } from 'next-auth/react';
import Link from "next/link";
import * as XLSX from "xlsx";

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
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [assignedName, setAssignedName] = useState("");
  const [assignedFrom, setAssignedFrom] = useState("");
  const [userName, setUserName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [referenceData, setReferenceData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [user, setuser] = useState([]);
  const [selectedReference, setSelectedReference] = useState(null);
  const { data: session } = useSession();
  const [branch, setBranch] = useState("");
  const [showClosed, setShowClosed] = useState(false);
  const options = [
    { value: "interested_but_not_proper_response", label: "Interested but not proper response" },
    { value: "Wrong Lead Looking For Job", label: "Wrong Lead Looking For Job" },
    { value: "no_connected", label: "No Connected" },
    { value: "not_lifting", label: "Not Lifting" },
    { value: "busy", label: "Busy" },
    { value: "not_interested", label: "Not Interested" },
    { value: "wrong_no", label: "Wrong No" },
    { value: "no_visit_branch_yet", label: "No Visit Branch Yet" }
  ];

  // ✅ State to store selected reasons
  const [reason, setReason] = useState([]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Toggle selection of an option
  const toggleOption = (value) => {
    setReason((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((option) => option !== value)
        : [...prevSelected, value]
    );
  };

  // ✅ Handles click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const fetchFilteredData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/report/fetchalloverview/query", {
        params: {
          referenceId,
          suboption,
          fromDate,
          toDate,
          admission,
          grade,
          reason: reason.length > 0 ? reason.join(",") : "",
          location,
          branch,
          city,
          assignedName,
          assignedFrom,
          userName,
          showClosed,
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
    fetchFilteredData();
  }, [referenceId, studentName, suboption, fromDate, branch, toDate, admission, grade, reason, location, city, assignedName, assignedFrom, userName, showClosed]);

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
    setBranch("");
    setLocation("");
    setCity("");
    setAssignedName("");
    setAssignedFrom("");
    setUserName("");
    setStudentName("");
  };


  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(allquery);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Queries");
    XLSX.writeFile(workbook, "queries.xlsx");
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
    if (userName) filters.push(`Creater Name: ${userName}`);
    if (showClosed) filters.push(`Closed Queries`);
    if (studentName) filters.push(`StudentName : ${studentName}`);
    if (branch) filters.push(`Branch: ${branch}`);
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
          <div className="flex justify-between items-center gap-5 mb-4">
            <button
              onClick={exportToExcel}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Export to Excel
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
                <th className="px-4 py-3 text-[12px] ">Branch
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-5 ms-2  text-gray-800  border focus:ring-0 focus:outline-none"
                  >
                    <option value="">All</option>
                    {branches.map((data, index) => (
                      <option key={index} value={data.branch_name}>
                        {data.branch_name}
                      </option>
                    ))}
                  </select>
                </th>
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
                    <th className="px-4 py-3 text-[12px] relative">

                      <div ref={dropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="ms-2 px-2 py-1 text-white border rounded-md text-left focus:ring-0 focus:outline-none"
                        >
                          <span>Reason</span>
                        </button>

                        {dropdownOpen && (
                          <div className="absolute left-0 mt-2 w-52 bg-white border rounded-md shadow-md z-10">
                            <div className="p-2 max-h-48 overflow-y-auto">
                              {options.map((option) => (
                                <label key={option.value} className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    value={option.value}
                                    checked={reason.includes(option.value)}
                                    onChange={(e) => toggleOption(e.target.value)}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm text-gray-800">{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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
                    <td className="px-4 py-3 text-[12px] text-blue-500"> <Link href={`/main/page/allquery/${data._id}`}>{data.studentName}</Link></td>
                    <td className="px-4 py-3 text-[12px]">{data.studentContact.phoneNumber}</td>
                    <td className="px-4 py-3 text-[12px]"> {data.historyCount}</td>
                    <td className="px-4 py-3 text-[12px]">{data.referenceid} {data.suboption}</td>
                    <td className="px-4 py-3 text-[12px] relative">
                      <span className="overflow-hidden whitespace-nowrap text-ellipsis">{data.lastmessage?.slice(0, 12)}...</span>
                      <div className="absolute cursor-pointer left-0 bottom-0 bg-gray-800 text-white p-2 rounded-md opacity-0 transition-opacity hover:opacity-100 max-w-xs w-48">
                        {data.lastmessage}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px]">{data.branch}</td>
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

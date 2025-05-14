"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader/Loader';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Search, Trash2, CirclePlus, Filter, X ,Send, XCircleIcon } from "lucide-react";
import BulkAssign from '@/components/BulkAssign/BulkAssign';
import Link from 'next/link';

export default function AllQuery() {
  const [queries, setqueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [queriesPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedqueries, setSelectedqueries] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterByGrade, setFilterByGrade] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [user, setuser] = useState([]);
  const [deadlineFilter, setDeadlineFilter] = useState(""); // State for deadline filter
  const [grades, setGrades] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);




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

  useEffect(() => {
    const fetchquerieData = async () => {
      try {
        const response = await axios.get('/api/queries/fetchallbytype/open');
        setqueries(response.data.fetch);
      } catch (error) {
        console.error('Error fetching querie data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchquerieData();
  }, []);

  const router = useRouter();
  const handleRowClick = (id) => {
    router.push(`/main/page/allquery/${id}`);
  };
  const toggleFilterPopup = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Sort queries based on selected order
  // Sort queries based on selected order
  const sortqueries = (queries) => {
    const today = new Date().setHours(0, 0, 0, 0);

    const sortedQueries = queries.sort((a, b) => {
      const dateA = new Date(a.deadline).setHours(0, 0, 0, 0);
      const dateB = new Date(b.deadline).setHours(0, 0, 0, 0);

      // Sort today’s dates first
      if (dateA === today && dateB === today) return 0;
      if (dateA === today) return -1;
      if (dateB === today) return 1;

      // Sort past dates next (in descending order)
      if (dateA < today && dateB < today) return dateB - dateA;

      // Sort future dates last (in ascending order)
      if (dateA > today && dateB > today) return dateA - dateB;

      // Place past dates before future dates
      return dateA < today ? -1 : 1;
    });

    return sortedQueries;
  };





  // Declare all required states
  const [customDate, setCustomDate] = React.useState(""); // State for custom date
  const [startDate, setStartDate] = React.useState(""); // State for start date of range
  const [endDate, setEndDate] = React.useState(""); // State for end date of range

  const filterByDeadline = (querie) => {
    const currentDate = new Date();
    const querieDeadline = new Date(querie.deadline);

    switch (deadlineFilter) {
      case "today":
        return querieDeadline.toDateString() === currentDate.toDateString();
      case "tomorrow":
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(currentDate.getDate() + 1);
        return querieDeadline.toDateString() === tomorrow.toDateString();
      case "dayAfterTomorrow":
        const dayAfterTomorrow = new Date(currentDate);
        dayAfterTomorrow.setDate(currentDate.getDate() + 2);
        return querieDeadline.toDateString() === dayAfterTomorrow.toDateString();
      case "past":
        return querieDeadline < new Date(currentDate.setHours(0, 0, 0, 0));
      case "custom":
        const customDateObj = new Date(customDate);
        return querieDeadline.toDateString() === customDateObj.toDateString();
      case "dateRange":
        if (!startDate || !endDate) return true; // If dates are not set, skip filter
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end day
        return querieDeadline >= start && querieDeadline <= end;
      default:
        return true; // 'All' will display all queries
    }
  };

  const filteredqueries = sortqueries(
    queries.filter(querie =>
      (
        (querie.studentName && querie.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (querie.studentContact?.phoneNumber?.includes(searchTerm)) ||
        (querie.referenceid && querie.referenceid.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (filterCourse === "" || querie.branch?.includes(filterCourse)) &&
      filterByDeadline(querie) && // Ensure the deadline filter is applied
      (filterByGrade === "" || querie.lastgrade === filterByGrade) // Add filter by grade
    )
  );





  // Pagination logic
  // const indexOfLastquerie = currentPage * queriesPerPage;
  // const indexOfFirstquerie = indexOfLastquerie - queriesPerPage;
  // const currentqueries = filteredqueries.slice(indexOfFirstquerie, indexOfLastquerie);
  // const totalPages = Math.ceil(filteredqueries.length / queriesPerPage);

  // const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle multi-select for bulk actions
  const handleSelectquerie = (id) => {
    if (selectedqueries.includes(id)) {
      setSelectedqueries(selectedqueries.filter(querieId => querieId !== id));
    } else {
      setSelectedqueries([...selectedqueries, id]);
    }
  };



  const handleBulkDelete = async () => {
    const isConfirmed = window.confirm("Are you sure you want to Send in Trash this Queries?");
    if (isConfirmed) {

      try {
        // Make a DELETE request to the API with the selected branches' IDs in the request body
        await axios.delete('/api/queries/trash', {
          data: { ids: selectedqueries } // Pass the ids in the 'data' field for DELETE request
        });

        // Filter out the deleted branches from the state
        setqueries(queries.filter(querie => !selectedqueries.includes(querie._id)));

        // Clear the selected branches after deletion
        setSelectedqueries([]);

        alert('Queries Send in Trash successfully');
      } catch (error) {
        console.error('Error deleting queries:', error);
        alert(error);
      }
    }
  };

  const handleBulkAssign = async () => {
    const isConfirmed = window.confirm("Are you sure you want to Assign these Queries?");
    if (isConfirmed) {
      try {
        // Open the modal and pass the selected queries
        setIsModalOpen(true); // Assuming you have a state to manage the modal visibility
        setModalData({ ids: selectedqueries }); // Pass the selected queries to the modal

        // Optionally, you can perform additional operations here
        console.log("Modal opened with data:", selectedqueries);
      } catch (error) {
        console.error("Error handling bulk assign:", error);
        alert("An error occurred while assigning queries.");
      }
    }
  };

  const handleremovebulk = async () => {
    setIsModalOpen(false);
  }



  return (
    <div className='container lg:w-[95%] mx-auto py-5'>


      {/* Search, Sort, Filter, and Bulk Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-1/3">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search By Student Name , Reference and Phone Number"
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
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                >
                  <option value="">All Branch</option>
                  {Array.from(new Set(queries.flatMap(querie => querie.branch))).map((branch, index) => (
                    <option key={index} value={branch}>{branch}</option>
                  ))}
                </select>
                <select
                  className="border px-3 py-2 focus:outline-none text-sm"
                  value={deadlineFilter} // Binding the deadline filter state
                  onChange={(e) => setDeadlineFilter(e.target.value)} // Update the deadline filter state
                >
                  <option value="" disabled>Deadline</option>
                  <option value="">All</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="dayAfterTomorrow">Day After Tomorrow</option>
                  <option value="past">Past Date</option>

                </select>




                <Link href={'/main/page/importquery'}>
                  <button className="bg-[#29234b] rounded-md flex items-center text-white text-sm px-4 py-2 ">
                    <CirclePlus size={16} className='me-1' /> Import Query
                  </button>
                </Link>
                <Link href={'/main/page/addquery'}>
                  <button className="bg-[#29234b] rounded-md flex items-center text-white text-sm px-4 py-2">
                    <CirclePlus size={16} className='me-1' /> Add Query
                  </button>
                </Link>

                <button
                  className="text-red-500 rounded-md border border-red-500 px-3 py-2"
                  onClick={handleBulkDelete}
                  disabled={selectedqueries.length === 0}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Filter Section */}
        <div className="hidden lg:flex flex-wrap space-x-3">
          <select
            className="border px-3 py-2 focus:outline-none text-sm"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="">All Branch</option>
            {Array.from(new Set(queries.flatMap((querie) => querie.branch)))
              .filter((branch) => branch && branch.trim() !== "") // Exclude undefined or empty values
              .map((branch, index) => (
                <option key={index} value={branch}>
                  {branch}
                </option>
              ))}
          </select>

          <select
            value={filterByGrade}
            onChange={(e) => setFilterByGrade(e.target.value)}
            className="px-2 py-1 border"
          >
            <option value="">All Grades</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>

          </select>
          <div className=' relative'>
            <select
              className="border px-3 py-2 focus:outline-none text-sm"
              value={deadlineFilter} // Binding the deadline filter state
              onChange={(e) => setDeadlineFilter(e.target.value)} // Update the deadline filter state
            >
              <option value="" disabled>Deadline</option>
              <option value="">All</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="dayAfterTomorrow">Day After Tomorrow</option>
              <option value="past">Past Date</option>
              <option value="custom">Custom Date</option>
              <option value="dateRange">Date-to-Date</option> {/* Add Date-to-Date option */}
            </select>

            {/* Show custom date picker when "Custom Date" is selected */}
            {deadlineFilter === "custom" && (
              <div className=' absolute'>
                <input
                  type="date"
                  className="border px-3 py-2 focus:outline-none text-sm"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)} // Update custom date state
                />
              </div>
            )}

            {/* Show start and end date pickers when "Date-to-Date" is selected */}
            {deadlineFilter === "dateRange" && (
              <div className="flex space-x-2 absolute bg-white border border-black">
                <input
                  type="date"
                  className="border px-3 py-2 focus:outline-none text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} // Update start date state
                /> <div className=' flex items-center'>to</div>
                <input
                  type="date"
                  className="border px-3 py-2 focus:outline-none text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)} // Update end date state
                />
              </div>
            )}


          </div>

          {/* <select
            className="border px-3 py-2 focus:outline-none text-sm"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select> */}

          <Link href={'/main/page/importquery'}>
            <button className="bg-[#29234b] rounded-md flex items-center text-white text-sm px-4 py-2 ">
              <CirclePlus size={16} className='me-1' /> Import Query
            </button>
          </Link>

          <Link href={'/main/page/addquery'}>
            <button className="bg-[#29234b] rounded-md flex items-center text-white text-sm px-4 py-2 ">
              <CirclePlus size={16} className='me-1' /> Add Query
            </button>
          </Link>

          <button
            className="text-red-500 rounded-md border border-red-500 px-3 py-2"
            onClick={handleBulkDelete}
            disabled={selectedqueries.length === 0}
          >
            <Trash2 size={16} />
          </button>

          
          <button
            className="text-blue-500 rounded-md border border-blue-500 hover:bg-blue-200 duration-150 cursor-pointer px-3 py-2"
            onClick={handleBulkAssign}
            disabled={selectedqueries.length === 0}
          >
            <Send size={16} />
          </button>

          {isModalOpen && (
            <>
              <div
                className="fixed   inset-0 flex items-center justify-center  z-50"
                role="dialog"
                aria-modal="true"
              >
                <div className='bg-white p-6 rounded-lg shadow-lg max-w-lg w-full'>
                  <div className=' flex justify-end'>
                    <button onClick={handleremovebulk}><XCircleIcon className=' text-red-600' /></button>
                  </div>
                  <BulkAssign
                    onClose={() => setIsModalOpen(false)}
                    data={modalData}
                    initialData={modalData}
                  />
                </div>
              </div>

            </>
          )}
        </div>

      </div>
      <div className="flex flex-wrap justify-between gap-4 mt-2 text-sm py-1">


        <div>
          <div className="flex items-center gap-1 bg-gray-200 px-2 rounded-md">
            <span className="">Total Queries =</span>
            <span className=" font-semibold">{filteredqueries.length}</span>
          </div>
        </div>

        {/* Legend Item */}
        <div className=' flex flex-wrap gap-4'>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full animate-blink"></span>
            <span className="text-gray-600">Past Due</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            <span className="text-gray-600">Due Today</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#fcccba]"></span>
            <span className="text-gray-600">Due Tomorrow</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#ffe9bf]"></span>
            <span className="text-gray-600">Due Day After Tomorrow</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#6cb049]"></span>
            <span className="text-gray-600">Enrolled</span>
          </div>
        </div>
      </div>

      {/* querie Table */}
      <div className="relative overflow-x-auto shadow-md  bg-white   border border-gray-200">

        <table className="w-full text-sm text-left rtl:text-right text-gray-600 font-sans">
          <thead className="bg-[#29234b] text-white uppercase">
            <tr>
              <th scope="col" className="px-4 font-medium capitalize py-2">
                {/* <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedqueries(
                      e.target.checked
                        ? queries.map(querie => querie._id)
                        : []
                    )
                  }
                  checked={selectedqueries.length === queries.length}
                /> */}
                N/O
              </th>
              <th scope="col" className="px-4 font-medium capitalize py-2">Staff Name</th> {/* Added User Name column */}
              <th scope="col" className="px-4 font-medium capitalize py-2">Student Name <span className=' text-xs'>(Reference)</span></th>
              <th scope="col" className="px-4 font-medium capitalize py-2">Branch</th>
              <th scope="col" className="px-4 font-medium capitalize py-2">Phone Number</th>
              <th scope="col" className="px-4 font-medium capitalize py-2">Grade</th>
              <th scope="col" className="px-4 font-medium capitalize py-2">Assigned from</th>
              <th scope="col" className="px-4 font-medium capitalize py-2">Assigned To</th>
              <th scope="col" className="px-4 font-medium capitalize py-2">DeadLine</th>
              <th scope="col" className="px-4 font-medium capitalize py-2">Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4">
                  <div className="flex justify-center items-center h-[300px]">
                    <Loader />
                  </div>
                </td>
              </tr>
            ) : filteredqueries.length > 0 ? (
              filteredqueries.map((querie, index) => {


                const matchedUser = user.find((u) => u._id === querie.userid);
                const matchedassignedUser = user.find((u) => u._id == querie.assignedreceivedhistory);
                const matchedassignedsenderUser = user.find((u) => u._id == querie.assignedsenthistory);

                return (
                  <>
                    <tr
                      key={querie._id}
                      className={`border-b cursor-pointer transition-colors duration-200 relative
          ${querie.addmission ? 'bg-[#6cb049] text-white' :
                          new Date(querie.deadline).toDateString() === new Date().toDateString() ? 'bg-red-500 text-white' :
                            new Date(querie.deadline) < new Date() ? 'text-white animate-blink' :
                              new Date(querie.deadline).toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString() ? 'bg-[#fcccba] text-black' :
                                new Date(querie.deadline).toDateString() === new Date(Date.now() + 48 * 60 * 60 * 1000).toDateString() ? 'bg-[#ffe9bf] text-black' :
                                  ''
                        }`}
                    >
                      <td className="px-4 py-2 relative">
                        <input
                          type="checkbox"
                          checked={selectedqueries.includes(querie._id)}
                          onChange={() => handleSelectquerie(querie._id)}
                        />
                        <span className="ms-2">{index + 1}</span>
                      </td>

                      <td onClick={() => handleRowClick(querie._id)} className="px-4 py-2 text-[12px] font-semibold">
                        {matchedUser ? matchedUser.name : 'Tifa Admin'}
                      </td>

                      <td className="px-4 py-2 font-semibold text-sm whitespace-nowrap" onClick={() => handleRowClick(querie._id)}>
                        {querie.studentName} <span className="text-xs">({querie.referenceid})</span>
                      </td>

                      <td onClick={() => handleRowClick(querie._id)} className="px-4 py-2 text-[12px]">
                        {querie.branch}
                      </td>

                      <td onClick={() => handleRowClick(querie._id)} className="px-4 py-2 text-[12px]">
                        {querie.studentContact.phoneNumber}
                      </td>

                      <td onClick={() => handleRowClick(querie._id)} className="px-4 py-2 text-[12px]">
                        {querie.lastgrade}
                      </td>
                      <td onClick={() => handleRowClick(querie._id)} className="px-4 py-2 text-[12px]">
                        {matchedassignedsenderUser ? matchedassignedsenderUser.name : ''}
                      </td>
                      <td onClick={() => handleRowClick(querie._id)} className="px-4 py-2 text-[12px]">

                        {matchedassignedUser ? matchedassignedUser.name : ''}
                      </td>

                      <td onClick={() => handleRowClick(querie._id)} className="px-4 py-2 text-[12px]">
                        {`${String(new Date(querie.deadline).getDate()).padStart(2, '0')}-${String(new Date(querie.deadline).getMonth() + 1).padStart(2, '0')}-${String(new Date(querie.deadline).getFullYear()).slice(-2)}`}
                      </td>

                      <td onClick={() => handleRowClick(querie._id)} className="px-4 py-2 text-[12px]">
                        {querie.studentContact.address}
                      </td>

                      <span className="absolute right-0 top-0 bottom-0 flex items-center">
                        {!querie.addmission && (
                          new Date(querie.lastDeadline) < new Date() && new Date(querie.lastDeadline).toDateString() !== new Date().toDateString() ? (
                            <span className="inline-flex items-center px-2 text-[10px] font-semibold text-red-600 bg-red-200 rounded-full shadow-md">
                              ✖️ Today Update
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 text-[10px] font-semibold text-green-600 bg-green-200 rounded-full shadow-md">
                              ✔️ Checked
                            </span>
                          )
                        )}
                      </span>
                    </tr>


                    <tr className="border-b bg-gray-200">
                      <td colSpan="10" className="px-4">
                        <div className="flex flex-wrap gap-4">
                          <p className="font-bold text-xs">Last Action</p>


                          <p className=' text-xs'><strong>Action By = </strong>{querie.lastactionby} </p>

                          <ul>

                            <li className='text-xs'>
                              <strong>Message = </strong>
                              {querie.lastmessage !== "null" ? querie.lastmessage : querie.notes}
                            </li>


                          </ul>

                        </div>
                      </td>
                    </tr>


                  </>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No queries available
                </td>
              </tr>
            )}
          </tbody>

        </table>

        {/* Pagination
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
        /> */}
      </div>
    </div>
  );
}

// const Pagination = ({ currentPage, totalPages, paginate }) => {
//   return (
//     <div className="flex justify-center my-4">
//       <button
//         onClick={() => paginate(currentPage - 1)}
//         disabled={currentPage === 1}
//         className={`px-3 py-1 mx-1 text-sm border rounded ${currentPage === 1 ? 'cursor-not-allowed bg-gray-200' : 'bg-[#6cb049] text-white'}`}
//       >
//         <ArrowLeft size={18} />
//       </button>

//       <span className="px-3 py-1 mx-1 text-sm border rounded bg-gray-200">
//         Page {currentPage} of {totalPages}
//       </span>

//       <button
//         onClick={() => paginate(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         className={`px-3 py-1 mx-1 text-sm border rounded ${currentPage === totalPages ? 'cursor-not-allowed bg-gray-200' : 'bg-[#6cb049] text-white'}`}
//       >
//         <ArrowRight size={18} />
//       </button>
//     </div>
//   );
// };

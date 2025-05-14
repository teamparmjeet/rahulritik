import React, { useState } from 'react'
import { PhoneCall, CheckCircle, CircleDashed, Navigation, Locate, LocateOff, Trash } from "lucide-react";
import { XCircle } from "lucide-react"
import Link from 'next/link';
import * as XLSX from 'xlsx';
export default function StaffReport({ data }) {
    const [open, setOpen] = useState(false);
    const enrolledQueries = data.filter(item => item.addmission === true);
    const exportToExcel = () => {
        if (enrolledQueries.length === 0) {
            alert("No data to export!");
            return;
        }

        // Create a worksheet from the enrolledQueries data
        const ws = XLSX.utils.json_to_sheet(enrolledQueries, {
            header: ["studentName", "branch", "total"],  // Optional: Define headers
            cellDates: true,
        });

        // Create a new workbook and append the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Enrolled Queries");

        // Export the workbook as an Excel file
        XLSX.writeFile(wb, "Enrolled_Queries.xlsx");
    };
    return (
        <div>
            <div className=' grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-6 p-6  bg-gray-50 rounded-xl'>

                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-blue-100 rounded-full'>
                        <PhoneCall className='w-4 h-4 text-blue-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className=' font-bold text-gray-800'>{data.length}</p>
                        <p className='text-gray-500'>Total Query</p>
                    </div>
                </div>

                <div className=" flex justify-between items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center'>
                        <div className='flex items-center justify-center w-4 h-4 bg-green-100 rounded-full'>
                            <CheckCircle className='w-4 h-4 text-green-500' />
                        </div>
                        <div className='ml-4 flex gap-4'>
                            <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.addmission == true).length}
                            </p>
                            <p className='text-gray-500'>Enrolled Queries</p>
                        </div>
                    </div>
                    <button onClick={() => setOpen(true)} className=' text-sm bg-blue-400 rounded hover:bg-blue-500 text-white px-2'>View</button>
                </div>
                {open && (
                    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                        <div className='bg-white p-6 rounded-lg shadow-lg w-2/3'>
                            <button
                                onClick={exportToExcel}
                                className='mt-4 bg-green-400 text-white py-2 px-4 rounded hover:bg-green-500'>
                                Export to Excel
                            </button>
                            <div className='flex justify-between items-center mb-4'>
                                <h2 className='text-xl font-bold'>Enrolled Queries</h2>
                                <button className='text-red-500' onClick={() => setOpen(false)}><XCircle /></button>
                            </div>
                            <div className=' overflow-scroll max-h-96'>
                                {enrolledQueries.length > 0 ? (
                                    <table className='min-w-full bg-white border border-gray-200'>
                                        <thead>
                                            <tr className='bg-gray-100'>

                                                <th className='border px-4 py-2 text-left'>Student Name</th>
                                                <th className='border px-4 py-2 text-left'>Branch Name</th>
                                                <th className='border px-4 py-2 text-left'>Received Fees</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enrolledQueries.map(query => (
                                                <tr key={query.id} className='border'>
                                                    <td className='border px-4 py-2'><Link href={`/main/page/allquery/${query._id}`} className=' text-blue-700 capitalize'>{query.studentName}</Link></td>
                                                    <td className='border px-4 py-2'>{query.branch}</td>
                                                    <td className='border px-4 py-2'>{query.total} ₹</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className='text-gray-500'>No enrolled queries available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-green-100 rounded-full'>
                        <CheckCircle className='w-4 h-4 text-green-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.demo === true && item.total > 0 && item.addmission == false).length}
                        </p>
                        <p className='text-gray-500'>Under Demo  With Some Fees</p>
                    </div>
                </div>

                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-orange-100 rounded-full'>
                        <CircleDashed className='w-4 h-4 text-orange-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.addmission == false && item.autoclosed === "open").length}
                        </p>
                        <p className='text-gray-500'>Pending Queries</p>
                    </div>
                </div>

                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-blue-100 rounded-full'>
                        <Navigation className='w-4 h-4 text-blue-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.demo == true).length}
                        </p>
                        <p className='text-gray-500'>Demo Queries</p>

                    </div>
                </div>

                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-blue-100 rounded-full'>
                        <Navigation className='w-4 h-4 text-blue-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.stage === 6).length}
                        </p>
                        <p className='text-gray-500'>Visited Queries</p>
                    </div>
                </div>
                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-blue-100 rounded-full'>
                        <Locate className='w-4 h-4 text-blue-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.studentContact.city === "Jaipur").length}
                        </p>
                        <p className='text-gray-500'>Jaipur Queries</p>
                    </div>
                </div>

                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-gray-100 rounded-full'>
                        <LocateOff className='w-4 h-4 text-gray-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.studentContact.city !== "Jaipur").length}
                        </p>
                        <p className='text-gray-500'>Out Of Jaipur Queries</p>
                    </div>
                </div>

                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-red-100 rounded-full'>
                        <Trash className='w-4 h-4 text-red-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.autoclosed === "close" && item.addmission === false).length}
                        </p>
                        <p className='text-gray-500'>Trash Queries</p>
                    </div>
                </div>


            </div>
        </div>
    )
}

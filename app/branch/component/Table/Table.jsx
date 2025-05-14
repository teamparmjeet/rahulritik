import React from 'react'
import Link from 'next/link';
export default function Table({ data }) {
    return (
        <>
            <div className="overflow-x-auto  shadow-lg rounded-lg border border-gray-300">
                <table className="min-w-full text-left text-[12px] font-light border-collapse">
                    <thead className="bg-gray-800 text-white">
                        <tr className="divide-x divide-gray-700">
                            <th className="px-4 py-3 text-[12px]">Sr No.</th>
                            <th className="px-4 py-3 text-[12px]">Student Name</th>
                            <th className="px-4 py-3 text-[12px]">Phone Number</th>
                            <th className="px-4 py-3 text-[12px]">No Of Contact</th>
                            <th className="px-4 py-3 text-[12px]">Message</th>
                            <th className="px-4 py-3 text-[12px]">City</th>
                            <th className="px-4 py-3 text-[12px]">Grade</th>
                            <th className="px-4 py-3 text-[12px]">Assigned From</th>
                            <th className="px-4 py-3 text-[12px]">Assigned To</th>
                            <th className="px-4 py-3 text-[12px]">Branch</th>
                            <th className="px-4 py-3 text-[12px]">Created Date</th>
                            <th className="px-4 py-3 text-[12px]">Enroll</th>

                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((data, index) => (

                            <tr
                                key={index}
                                className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200 transition-all"
                            >
                                <td className="px-4 py-3 text-[12px]">{index + 1}</td>
                                <Link href={`/branch/page/allquery/${data._id}`}><td className="px-4 py-3 text-[12px]">{data.studentName}</td></Link>
                                <td className="px-4 py-3 text-[12px]">{data.studentContact.phoneNumber}</td>
                                <td className="px-4 py-3 text-[12px]"> {data.historyCount}</td>
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
                                <td className="px-4 py-3 text-[12px]">{data.branch}</td>
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

                                <td className="px-4 py-3 text-[12px]">{data.addmission ? "Yes" : "No"}</td>

                            </tr>

                        ))}
                    </tbody>
                </table>
            </div >
        </>
    )
}

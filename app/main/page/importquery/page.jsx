"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import * as XLSX from 'xlsx';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function Importquery() {
    const { data: session } = useSession();
    const [adminData, setAdminData] = useState(null);
    const [excelData, setExcelData] = useState([]);
    const [fileName, setFileName] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await axios.get(
                    `/api/admin/find-admin-byemail/${session?.user?.email}`
                );
                setAdminData(response.data.branch);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.email) fetchAdminData();
    }, [session]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setFileName(file.name); // Store file name to display later
        const reader = new FileReader();
        const fileType = file.name.split('.').pop();

        reader.onload = (e) => {
            let data = new Uint8Array(e.target.result);
            let workbook;

            if (fileType === 'csv') {
                const csvData = new TextDecoder('utf-8').decode(data);
                workbook = XLSX.read(csvData, { type: 'string' });
            } else {
                workbook = XLSX.read(data, { type: 'array' });
            }

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Get tomorrow's date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1); // Set the date to tomorrow
            const formattedTomorrow = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD

            const mappedData = jsonData.map((row) => ({
                studentName: row['studentName'],
                referenceid: row['referenceid'],
                phoneNumber: row['phoneNumber'], // Separate phone number
                whatsappNumber: row['whatsappNumber'], // Separate whatsapp Number number
                address: row['address'], // Separate address
                city: row['city'], // Separate city
                courseInterest: row['courseInterest'],
                deadline: formattedTomorrow, // Save tomorrow's date as deadline
                branch: adminData,
                notes: row['notes'] || '',
                qualification:row['qualification'],
                profession:row['profession'],
            }));
            setExcelData(mappedData);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleBulkUpload = async () => {
        setUploading(true);
        try {
            const dataToUpload = excelData.map((row) => ({
                studentName: row.studentName,
                referenceid:row.referenceid,
                studentContact: {
                    phoneNumber: row.phoneNumber,
                    whatsappNumber: row.whatsappNumber,
                    address: row.address,
                    city: row.city,
                },
                courseInterest: row.courseInterest,
                deadline: row.deadline,
                branch: row.branch,
                notes: row.notes,
                qualification:row.qualification,
                profession:row.profession,
            }));

            const response = await axios.post('/api/queries/import', dataToUpload);
            setUploadSuccess(response.data.success);
            if (response.data.success) {
                toast.success("Queries Import successfully!");
                window.location.reload();
            } else {
                toast.error("Error uploading queries!");
            }
        } catch (error) {
            toast.error("Error uploading queries!");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <Toaster />
            <h1 className="text-4xl font-bold mb-4 text-center text-[#6cb049]">Upload Excel/CSV Sheet</h1>

            {loading ? (
                <div className="flex justify-center">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12 mb-4"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            ) : (
                <div className="">
                    {/* Show the file input only if no file is selected */}
                    {!fileName && (
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileUpload}
                            className="block rounded-md border w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-5 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-medium file:bg-white file:text-gray-700 hover:file:bg-gray-50 file:hover:border-gray-400 file:transition-all file:duration-200 file:ease-in-out mb-4 cursor-pointer"
                        />
                    )}

                   

                    {excelData.length > 0 && (
                        <>
                            <button
                                onClick={handleBulkUpload}
                                disabled={uploading}
                                className={`bg-[#6cb049] text-white py-2 px-6 rounded-lg mt- transition-all duration-200 ease-in-out hover:bg-[#5ba040] ${uploading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                            >
                                {uploading ? "Uploading..." : "Upload Data to Database"}
                            </button>

                            <div className="overflow-x-auto mt-2 w-full">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            {['studentName','referenceid', 'phoneNumber','whatsappNumber', 'address','city', 'courseInterest', 'deadline', 'branch', 'notes','qualification','profession'].map((key, index) => (
                                                <th key={index} className="py-3 capitalize px-6 border bg-[#6cb049] text-left text-sm font-medium text-white">
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {excelData.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="hover:bg-gray-50">
                                                {Object.values(row).map((val, cellIndex) => (
                                                    <td key={cellIndex} className="py-3 px-6 border border-gray-300 text-sm text-gray-700">
                                                        {val}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

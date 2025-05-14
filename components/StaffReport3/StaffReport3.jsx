"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PhoneCall, CheckCircle, CircleDashed, Navigation, Locate, LocateOff, Trash } from "lucide-react";

export default function StaffReport3({ data }) {
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        const fetchBranchData = async () => {
            try {
                const response = await axios.get('/api/branch/fetchall/branch');
                setBranches(response.data.fetch);
            } catch (error) {
                console.error('Error fetching branch data:', error);
            }
        };
        fetchBranchData();
    }, []);



    const branchStats = {};
    data.forEach(item => {
        if (item.lastbranch && item.autoclosed === "open") {
            if (!branchStats[item.lastbranch]) {
                branchStats[item.lastbranch] = { total: 0, demo: 0, enrolled: 0 }; // Initialize all properties
            }
            branchStats[item.lastbranch].total += 1;
            if (item.demo === true) {
                branchStats[item.lastbranch].demo += 1;
            }
            if (item.addmission === true) {
                branchStats[item.lastbranch].enrolled += 1;
            }
        }
    });



    return (
        <div>
            <div className='grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl'>

                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-blue-100 rounded-full'>
                        <PhoneCall className='w-4 h-4 text-blue-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className='font-bold text-gray-800'>{data.length}</p>
                        <p className='text-gray-500'>Total Query</p>
                    </div>
                </div>

                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-green-100 rounded-full'>
                        <CheckCircle className='w-4 h-4 text-green-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.addmission == true).length}</p>
                        <p className='text-gray-500'>Enrolled Queries</p>
                    </div>
                </div>

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
                        <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.addmission == false && item.autoclosed === "open").length}</p>
                        <p className='text-gray-500'>Pending Queries</p>
                    </div>
                </div>
                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-blue-100 rounded-full'>
                        <Navigation className='w-4 h-4 text-blue-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.demo == true).length}</p>
                        <p className='text-gray-500'>Demo Queries</p>
                    </div>
                </div>

                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-blue-100 rounded-full'>
                        <Locate className='w-4 h-4 text-blue-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.studentContact.city === "Jaipur").length}</p>
                        <p className='text-gray-500'>Jaipur Queries</p>
                    </div>
                </div>

                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-gray-100 rounded-full'>
                        <LocateOff className='w-4 h-4 text-gray-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.studentContact.city !== "Jaipur").length}</p>
                        <p className='text-gray-500'>Out Of Jaipur Queries</p>
                    </div>
                </div>

                <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
                    <div className='flex items-center justify-center w-4 h-4 bg-red-100 rounded-full'>
                        <Trash className='w-4 h-4 text-red-500' />
                    </div>
                    <div className='ml-4 flex gap-4'>
                        <p className='text-xl font-bold text-gray-800'>{data.filter(item => item.autoclosed === "close" && item.addmission === false).length}</p>
                        <p className='text-gray-500'>Trash Queries</p>
                    </div>
                </div>
            </div>

            {/* Branch-wise Demo Query Count */}
            <div className='mt-6 bg-white p-4 rounded-lg shadow-md'>
                <h2 className='text-lg font-semibold text-gray-700 mb-2'>Branch Statics</h2>
                <div className='grid grid-cols-3 gap-4'>
                    {branches.map((branch) => (
                        <div key={branch.branch_name} className='bg-gray-100 p-2 rounded-lg'>
                            <p className='text-gray-800 font-semibold'>{branch.branch_name}</p>
                            <p className='text-gray-500'>Total Received: {branchStats[branch.branch_name]?.total || 0}</p>
                            <p className='text-gray-500'>Demo Count: {branchStats[branch.branch_name]?.demo || 0}</p>
                            <p className='text-gray-500'>Enrolled Count: {branchStats[branch.branch_name]?.enrolled || 0}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Input from '@/components/input/Input';
import toast, { Toaster } from 'react-hot-toast';
import { User, Mail, Lock, MapPin, Shield } from "lucide-react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function Page() {
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        password: '',
        branch: '',
        usertype: ''
    });
    const [loading, setLoading] = useState(false);
    const [branchLoading, setBranchLoading] = useState(true);

    useEffect(() => {
        const fetchBranchData = async () => {
            try {
                const response = await axios.get('/api/branch/fetchall/branch');
                setBranches(response.data.fetch);
            } catch (error) {
                console.error('Error fetching branch data:', error);
                toast.error('Error fetching branch data');
            } finally {
                setBranchLoading(false);
            }
        };

        fetchBranchData();
    }, []);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePhoneChange = (mobile) => {
        setFormData({
            ...formData,
            mobile
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/api/admin/create', formData);
            toast.success('User created successfully');

            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error in creating User';

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="container lg:w-[90%] mx-auto py-5">
                <Toaster />
                <div className="bg-white shadow-lg   overflow-hidden border border-gray-200">
                    <div className="bg-[#29234b] text-white px-7 py-3 flex justify-between w-full">
                        <h1 className="text-lg font-bold">Register Staff</h1>
                    </div>
                    <form className="px-5 py-3 space-y-3" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-12 gap-4">
                            <div className='relative sm:col-span-6 col-span-12'>
                                <Input
                                    placeholder="Enter Name"
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    icon={<User size={15} />}
                                    required
                                />
                            </div>
                        </div>



                        <PhoneInput
                            country={"in"}
                            value={formData.mobile}
                            onChange={handlePhoneChange}
                            className="w-full rounded-none"
                            required
                        />

                        <div className='relative'>
                            <Input
                                placeholder="Enter Email"
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                icon={<Mail size={15} />}
                                required
                            />
                        </div>

                        <div className='relative'>
                            <Input
                                placeholder="Enter Password"
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                icon={<Lock size={15} />}
                                required
                            />
                        </div>

                        <div className='relative'>
                            <label htmlFor="usertype" className="px-2 absolute h-full flex items-center text-green-500">
                                <Shield size={15} />
                            </label>
                            <select
                                name="usertype"
                                id="usertype"
                                value={formData.usertype}
                                onChange={handleInputChange}
                                className="block w-full px-7 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                                required
                            >
                                <option value="" disabled>Select Roll</option>

                                <option value="0">Staff</option>
                             

                            </select>
                        </div>


                        <div className='relative'>
                            <label htmlFor="branch" className="px-2 absolute h-full flex items-center text-green-500">
                                <MapPin size={15} />
                            </label>
                            <select
                                name="branch"
                                id="branch"
                                value={formData.branch}
                                onChange={handleInputChange}
                                className="block w-full px-7 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                                required
                            >
                                <option value="" disabled>Select a Branch</option>
                                {!branchLoading && branches.map((branch) => (
                                    <option key={branch._id} value={branch.branch_name}>{branch.branch_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-4">
                            <button
                                type="submit"
                                className={`w-full text-white bg-[#6cb049] py-3 px-5 rounded-md hover:bg-[#57a23e] ${loading ? 'cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Branch Staff'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

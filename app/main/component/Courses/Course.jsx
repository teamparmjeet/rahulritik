"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Input from '@/components/input/Input';
import toast, { Toaster } from 'react-hot-toast';
import { Book, BookDashed } from "lucide-react";
import 'react-phone-input-2/lib/style.css';

export default function Page() {
    const [category, setCategory] = useState([]);
    const [formData, setFormData] = useState({
        course_name: '',
        description: '',
        category: '',
        fees: '',
        enrollpercent: ''

    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBranchData = async () => {
            setLoading(true); // Set loading to true before fetching
            try {
                const response = await axios.get('/api/CoursesCategory/fetchall/CoursesCategory');
                setCategory(response.data.fetch);
            } catch (error) {
                console.error('Error fetching branch data:', error);
                toast.error('Error fetching branch data');
            } finally {
                setLoading(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/api/course/create', formData);
            toast.success('Course created successfully');

            // Reset form data
            setFormData({
                course_name: '',
                description: '',
                category: '',
                fees: '',
                enrollpercent: ''
            });

            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error in creating Course';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="">
                <Toaster />
                <div className="bg-white shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-[#29234b] text-white px-7 py-3 flex justify-between w-full">
                        <h1 className="text-lg font-bold">Add Course</h1>
                    </div>
                    <form className="px-5 py-3 space-y-3" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-2">
                            <div className='relative'>
                                <Input
                                    placeholder="Enter Course Name"
                                    type="text"
                                    id="course_name"
                                    name="course_name"
                                    value={formData.course_name}
                                    onChange={handleInputChange}
                                    icon={<Book size={15} />}
                                    required
                                />
                            </div>

                            <div className='relative'>
                                <Input
                                    placeholder="Enter Fees"
                                    type="number"
                                    id="fees"
                                    min="0"
                                    name="fees"
                                    value={formData.fees}
                                    onChange={handleInputChange}
                                    icon={<Book size={15} />}
                                    required
                                />
                            </div>

                            <div className='relative'>
                                <Input
                                    placeholder="Enter Enroll Fees Percent"
                                    type="number"
                                    min="0"
                                    id="enrollpercent"
                                    name="enrollpercent"
                                    value={formData.enrollpercent}
                                    onChange={handleInputChange}
                                    icon={<Book size={15} />}
                                    required
                                />
                            </div>
                            <div className='relative'>
                                <label htmlFor="category" className="px-2 absolute h-full flex items-center text-green-500">
                                    <BookDashed size={15} />
                                </label>
                                <select
                                    name="category"
                                    id="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="block w-full px-7 py-3 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                                    required
                                >
                                    <option value="" disabled>Select Category</option>
                                    {category.map((item) => (
                                        <option key={item._id} value={item._id}>{item.category}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='relative'>
                                <textarea
                                    placeholder="Description"
                                    id="description"
                                    name="description"
                                    className='block w-full px-2 py-1 text-gray-500 bg-white border border-gray-200 rounded-md appearance-none placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm'
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <button
                                type="submit"
                                className={`w-full text-white bg-[#6cb049] py-3 px-5 rounded-md hover:bg-[#57a23e] ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Register Course'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

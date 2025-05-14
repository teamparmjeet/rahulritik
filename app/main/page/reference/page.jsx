"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Input from '@/components/input/Input';
import toast, { Toaster } from 'react-hot-toast';
import { Book, Loader2, Trash, Plus, Edit } from "lucide-react";
import 'react-phone-input-2/lib/style.css';

export default function Page() {
    const [formData, setFormData] = useState({
        referencename: '',
        suboptions: [{ name: '' }]
    });

    const [loading, setLoading] = useState(false);
    const [referenceData, setReferenceData] = useState([]);
    const [fetching, setFetching] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const [editId, setEditId] = useState(null); // New state for edit mode

    const fetchReferences = async () => {
        setFetching(true);
        try {
            const response = await axios.get('/api/reference/fetchall/reference');
            setReferenceData(response.data.fetch);
        } catch (error) {
            toast.error("Error fetching reference data");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchReferences();
    }, []);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSuboptionChange = (index, e) => {
        const updatedSuboptions = formData.suboptions.map((suboption, subIndex) =>
            subIndex === index ? { ...suboption, name: e.target.value } : suboption
        );
        setFormData({ ...formData, suboptions: updatedSuboptions });
    };

    const addSuboption = () => {
        setFormData({ ...formData, suboptions: [...formData.suboptions, { name: '' }] });
    };

    const removeSuboption = (index) => {
        const updatedSuboptions = formData.suboptions.filter((_, subIndex) => subIndex !== index);
        setFormData({ ...formData, suboptions: updatedSuboptions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editId) {
                // Update reference
                await axios.put(`/api/reference/update/${editId}`, formData);
                toast.success('Reference updated successfully');
            } else {
                // Create new reference
                await axios.post('/api/reference/create', formData);
                toast.success('Reference created successfully');
            }
            setFormData({ referencename: '', suboptions: [{ name: '' }] });
            setEditId(null); // Reset edit mode
            fetchReferences();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error in creating/updating reference';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (reference) => {
        setEditId(reference._id); // Set the edit mode with the reference id
        setFormData({
            referencename: reference.referencename,
            suboptions: reference.suboptions || [{ name: '' }]
        });
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this reference?")) {
            try {
                const response = await axios.delete(`/api/reference/delete/${id}`);
                if (response.data.success) {
                    toast.success("Reference deleted successfully");
                    fetchReferences();
                } else {
                    toast.error(response.data.message || "Error deleting reference");
                }
            } catch (error) {
                toast.error("Error deleting reference");
            }
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = referenceData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(referenceData.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPaginationButtons = () => {
        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 border ${i === currentPage ? 'bg-[#6cb049] text-white' : 'bg-white text-gray-600'} hover:bg-[#57a23e] mx-1`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <>
            <div className="px-4 py-5 md:px-10 md:py-5">
                <Toaster />
                <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
                    <div className="lg:w-2/3 bg-white shadow-lg border border-gray-200 p-5">
                        <h2 className="text-lg font-bold mb-4">All References</h2>

                        {fetching ? (
                            <div className="flex justify-center items-center h-32">
                                <Loader2 className="animate-spin" size={35} />
                            </div>
                        ) : (
                            <>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f3f4f6] text-sm">
                                            <th className="border p-2">#</th>
                                            <th className="border p-2">Reference Name</th>
                                            <th className="border p-2">Sub-Options</th>
                                            <th className="border p-2 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentData.length > 0 ? (
                                            currentData.map((reference, index) => (
                                                <tr key={reference._id} className="text-sm">
                                                    <td className="border p-2">{indexOfFirstItem + index + 1}</td>
                                                    <td className="border p-2">{reference.referencename}</td>
                                                    <td className="border p-2">
                                                        {Array.isArray(reference.suboptions) ? (
                                                            <ul className='flex flex-wrap gap-4'>
                                                                {reference.suboptions.map((item, index) => (
                                                                    <li key={index}>
                                                                        {item.name}
                                                                        {index < reference.suboptions.length - 1 && ' / '}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            reference.suboption
                                                        )}
                                                    </td>


                                                    <td className=" bg-gradient-to-t from-white to-red-100 gap-4 p-2 text-center flex justify-center items-center h-full ">
                                                        <button
                                                            className="text-blue-500 hover:text-blue-700"
                                                            onClick={() => handleEdit(reference)}
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => handleDelete(reference._id)}
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="border p-2 text-center">
                                                    No references found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <div className="mt-4 flex justify-center">
                                    {renderPaginationButtons()}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="lg:w-1/3 bg-white shadow-lg border border-gray-200">
                        <div className="bg-[#29234b] text-white px-7 py-3 flex justify-between w-full">
                            <h1 className="text-lg font-bold">{editId ? "Edit Reference" : "Add Reference"}</h1>
                        </div>
                        <form className="px-5 py-3 space-y-3" onSubmit={handleSubmit}>
                            <Input
                                placeholder="Enter Reference Name"
                                type="text"
                                id="referencename"
                                name="referencename"
                                value={formData.referencename}
                                onChange={handleInputChange}
                                icon={<Book size={15} />}
                                required
                            />
                            <div className="space-y-2">
                                <label className="font-medium">Suboptions:</label>
                                {formData.suboptions.map((suboption, index) => (
                                    <div key={index} className="flex gap-2 w-full">
                                        <Input
                                            type="text"
                                            value={suboption.name}
                                            onChange={(e) => handleSuboptionChange(index, e)}
                                            placeholder="Suboption Name"
                                            icon={<Book size={15} />}

                                        />
                                        {formData.suboptions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSuboption(index)}
                                                className="text-red-500"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addSuboption}
                                    className="text-green-500 hover:text-green-700 flex items-center gap-1"
                                >
                                    <Plus size={16} /> Add Suboption
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="w-full text-white bg-[#6cb049] hover:bg-[#57a23e] p-2 rounded"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (editId ? "Update" : "Submit")}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const allSuggestions = ['John Doe', 'Jane Smith', 'Michael Johnson', 'Emily Davis', 'Sarah Wilson', 'David Brown'];

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        const filteredSuggestions = allSuggestions.filter((student) =>
            student.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(value ? filteredSuggestions : []);
    };

    const handleSearch = () => {
        if (query.trim()) {
            toast.success(`Search result: ${query}`);   
            setQuery(''); 
            setSuggestions([]);
        } else {
            toast('Please enter a search term');
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion); 
        setSuggestions([]); 
    };

    return (
        <div className="relative w-full mx-auto">
             <Toaster />
            <div className="flex">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search here..."
                    className="w-full p-1 border  border-r-0 rounded-l-md shadow-sm focus:outline-none "
                />
                <button
                    onClick={handleSearch}
                    className=" border border-l-0 p-2 rounded-r-md  focus:outline-none"
                >
                    <Search size={18}/>
                </button>
            </div>
            {suggestions.length > 0 && (
                <ul className="absolute bg-white border border-gray-300 w-full mt-1 rounded-md shadow-lg z-10">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            className="px-4 py-2 cursor-pointer hover:bg-[#6cb049] duration-150 hover:text-white"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

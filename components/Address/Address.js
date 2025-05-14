import { useState } from 'react';
import { Locationlist } from '@/constants/Location';
import {MapPin} from "lucide-react"
const LocationInput = ({ value, onChange }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const handleInputChange = (event) => {
        const inputValue = event.target.value;
        onChange({ target: { name: 'studentContact.address', value: inputValue } });

        if (inputValue) {
            const filteredSuggestions = Locationlist[0].location.filter(location =>
                location.toLowerCase().includes(inputValue.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
            setHighlightedIndex(-1);  // Reset highlight on input change
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (location) => {
        onChange({ target: { name: 'studentContact.address', value: location } });
        setSuggestions([]);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (event) => {
        if (suggestions.length > 0) {
            if (event.key === 'ArrowDown') {
                setHighlightedIndex((prevIndex) => (prevIndex + 1) % suggestions.length);
            } else if (event.key === 'ArrowUp') {
                setHighlightedIndex((prevIndex) => (prevIndex - 1 + suggestions.length) % suggestions.length);
            } else if (event.key === 'Enter' && highlightedIndex >= 0) {
                handleSuggestionClick(suggestions[highlightedIndex]);
            }
        }
    };

    return (
        <div className="relative">
        
            <input
                type="text"
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a location..."
                className="block w-full px-2 py-2 text-gray-500 bg-white border border-gray-200 placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                autoComplete="off"
            />
            {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {suggestions.map((location, index) => (
                        <li
                            key={index}
                            className={`px-3 py-1 text-gray-800 text-sm cursor-pointer hover:bg-gray-100 flex items-center  gap-1 ${
                                index === highlightedIndex ? 'bg-gray-100' : ''
                            }`}
                            onClick={() => handleSuggestionClick(location)}
                        >
                           <MapPin size={14} color='#6cb049'/> {location}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LocationInput;

import React, { useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UpdateQuery1({ query, audit }) {
  const { data: session } = useSession();

  const queryid = query._id;
  const userid = query.userid;
  const [connectionOption, setConnectionOption] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [message, setMessage] = useState('');
  const [deadline, setDeadline] = useState('');
  const router = useRouter();
  const [grade, setGrade] = useState('Null'); // New state for grade

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    setMessage(''); // Reset message when the option changes
  };
  const handleConnectionOptionChange = (event) => {
    setConnectionOption(event.target.value);
  };
  const handleGradeChange = (event) => {
    setGrade(event.target.value); // Handle grade selection
  };
  const handleDeadlineChange = (event) => {
    setDeadline(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prepare data to send to the backend
    const data = {
      queryId: queryid,
      actionby: session?.user?.name,
      connectionStatus: connectionOption,
      interestedsubStatus: selectedOption,
      message: message,
      stage: selectedOption === 'online' ? 2 : selectedOption === 'ofline' ? 3 : undefined,
      deadline: deadline || undefined, // Include deadline if provided
      grade: grade,

    };

    try {
      const response = await axios.patch('/api/audit/update', data);
      if (response.status === 200) {
        console.log('Query updated successfully:', response.data);
        router.push("./")

        // window.location.reload();
      } else {
        console.error('Error updating query:', response.statusText);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const today = new Date().toISOString().split('T')[0];


  return (
    <form onSubmit={handleSubmit} className="mx-auto bg-white shadow-xl rounded-lg">
      <h3 className="text-xl font-semibold mb-2 text-indigo-700">Select a Status</h3>


      <div className="mb-6">
        <label htmlFor="statusSelect" className="block text-lg font-medium text-gray-700 mb-2">
          Connection Status:
        </label>
        <select
          id="statusSelect"
          value={connectionOption}
          onChange={handleConnectionOptionChange}
          className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
        >
          <option value="" disabled>-- Select Status --</option>
          <option value="connected">Connected</option>
          <option value="no_connected">No Connected</option>
          <option value="not_lifting">Not Lifting</option>

        </select>
      </div>
      <div className="mb-6">
        <label htmlFor="statusSelect" className="block text-lg font-medium text-gray-700 mb-2">
          Interested Status:
        </label>
        <select
          id="statusSelect"
          value={selectedOption}
          onChange={handleOptionChange}
          className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
        >
          <option value="" disabled>-- Select Interested Status --</option>
          <option value="online">Online</option>
          <option value="ofline">Offline</option>
          <option value="response">Response</option>

        </select>
      </div>

      <div className="mb-6 transition-opacity duration-300 ease-in-out">
        <label htmlFor="deadline" className="block text-lg font-medium text-gray-700 mb-2">Deadline:</label>
        <input
          type="date"
          id="deadline"
          value={deadline}
          min={today} // Prevent selection of past dates
          onChange={handleDeadlineChange}
          className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="gradeSelect" className="block text-lg font-medium text-gray-700 mb-2">
          Student Visit Grade:
        </label>
        <select
          id="gradeSelect"
          value={grade}
          onChange={handleGradeChange}
          className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
        >
          <option value="Null">-- Select Grade --</option>
          <option value="A">Grade A (Student will visit in 1–2 days)</option>
          <option value="B">Grade B (Student will visit in 3–7 days)</option>
          <option value="C">Grade C (Student will visit beyond 7 days)</option>
        </select>
      </div>
      <div className="mb-6 transition-opacity duration-300 ease-in-out">
        <h4 className="text-lg font-semibold mb-3 text-[#29234b]">Message:</h4>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
          rows="4"
          name="message"
          placeholder="Please enter your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>


      <button
        type="submit"
        className="mt-6 w-full py-3 bg-[#29234b] text-white font-semibold rounded-md hover:bg-[#29234b] transition-colors duration-200"
      >
        Submit
      </button>
    </form>
  );
}

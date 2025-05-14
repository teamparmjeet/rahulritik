import React, { useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
export default function UpdateQuery({ query, audit }) {
  const { data: session } = useSession();
  const queryid = query._id;
  const userid = query.userid;
  const [selectedOption, setSelectedOption] = useState('');
  const [subOption, setSubOption] = useState('');
  const [interestedselectedOption, setInterestedselectedOption] = useState('');
  const [message, setMessage] = useState('');
  const [deadline, setDeadline] = useState('');
  const [grade, setGrade] = useState('Null'); // New state for grade

  const router = useRouter();
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    setSubOption('');
    setMessage('');
  };
  const handleGradeChange = (event) => {
    setGrade(event.target.value); // Handle grade selection
  };

  const handleSubOptionChange = (event) => {
    setSubOption(event.target.value);
  };

  const handleinterestedOptionChange = (event) => {
    setInterestedselectedOption(event.target.value);
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
      connectionStatus: selectedOption,
      message: message || subOption,
      connectedsubStatus: selectedOption === 'connected' ? subOption : undefined,
      no_connectedsubStatus: selectedOption === 'no_connected' ? subOption : undefined,
      not_liftingsubStatus: selectedOption === 'not_lifting' ? subOption : undefined,
      autoClose: selectedOption === 'wrong_no' ? true : false, // Set autoClose if wrong_no is selected
      deadline: deadline || undefined, // Include deadline if provided
      grade: grade,
    };
    if (interestedselectedOption === 'online') {
      data.stage = 2; // Set stage to 2 when online
    } else if (interestedselectedOption === 'ofline') {
      data.stage = 3; // Set stage to 3 when offline
    }


    // Safely access and increment status counts
    const statusCountsUpdate = {
      busy: audit?.statusCounts?.busy || 0,
      call_back: audit?.statusCounts?.call_back || 0,
      switch_off: audit?.statusCounts?.switch_off || 0,
      network_error: audit?.statusCounts?.network_error || 0,
    };

    // Increment the count based on selectedOption and subOption
    if (selectedOption === 'not_lifting' && subOption === 'busy') {
      statusCountsUpdate.busy += 1;
    } else if (selectedOption === 'not_lifting' && subOption === 'call_back') {
      statusCountsUpdate.call_back += 1;
    } else if (selectedOption === 'no_connected' && subOption === 'switch_off') {
      statusCountsUpdate.switch_off += 1;
    } else if (selectedOption === 'no_connected' && subOption === 'network_error') {
      statusCountsUpdate.network_error += 1;
    }

    // Check if any count reaches 3, if so, set autoClose to true
    if (
      statusCountsUpdate.busy >= 3 ||
      statusCountsUpdate.call_back >= 3 ||
      statusCountsUpdate.switch_off >= 3 ||
      statusCountsUpdate.network_error >= 3
    ) {
      data.autoClose = true; // Set autoClose to true in the data object
    }

    // Add the updated statusCounts to the data object
    data.statusCounts = {
      busy: statusCountsUpdate.busy,
      call_back: statusCountsUpdate.call_back,
      switch_off: statusCountsUpdate.switch_off,
      network_error: statusCountsUpdate.network_error,
    };

    try {
      // First API call to /api/audit/update
      const response = await axios.patch('/api/audit/update', data);

      if (response.status === 200) {
        console.log('Query updated successfully:', response.data);

        // Check if wrong_no was selected or any count reaches 3, then call the second API
        if (
          selectedOption === 'wrong_no' ||
          selectedOption === 'Wrong Lead Lokking For Job' ||
          subOption === 'not_interested' ||
          statusCountsUpdate.busy >= 3 ||
          statusCountsUpdate.call_back >= 3 ||
          statusCountsUpdate.switch_off >= 3 ||
          statusCountsUpdate.network_error >= 3
        ) {
          const newApiResponse = await axios.patch('/api/queries/update', {
            id: queryid,
            autoclosed: 'close', // Send autoClose: "close" if wrong_no or count reaches 3
          });

          if (newApiResponse.status === 200) {
            console.log('Query auto-closed successfully:', newApiResponse.data);
          } else {
            console.error('Error in auto-closing query:', newApiResponse.statusText);
          }
        }


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
          Main Status:
        </label>
        <select
          id="statusSelect"
          value={selectedOption}
          onChange={handleOptionChange}
          className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
        >
          <option value="" disabled>-- Select Status --</option>
          <option value="connected">Connected</option>
          <option value="no_connected">No Connected</option>
          <option value="not_lifting">Not Lifting</option>
          <option value="wrong_no">Wrong Number</option>
          <option value="Wrong Lead Lokking For Job">Wrong Lead Looking For Job</option>
        </select>
      </div>

      {/* Sub-options for 'Connected' */}
      {selectedOption === 'connected' && (

        <>

          <div className="mb-6 transition-opacity duration-300 ease-in-out">
            <h4 className="text-lg font-semibold mb-3 text-[#29234b]">Connected Options:</h4>
            <select
              value={subOption}
              onChange={handleSubOptionChange}
              className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
            >
              <option value="" disabled>-- Select Sub Option --</option>
              <option value="interested">Interested</option>
              <option value="not_interested">Not Interested</option>
            </select>
          </div>


        </>
      )}

      {subOption === 'interested' && (
        <div className="mb-6">
          <label htmlFor="interestedselectedOption" className="block text-lg font-medium text-gray-700 mb-2">
            Interested Status:
          </label>
          <select
            id="interestedselectedOption"
            value={interestedselectedOption}
            onChange={handleinterestedOptionChange}
            className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
          >
            <option value="" disabled>-- Select Interested Status --</option>
            <option value="online">Online</option>
            <option value="ofline">Offline</option>
            <option value="response">Response</option>

          </select>
        </div>
      )}


      {/* Sub-options for 'Not Lifting' */}
      {selectedOption === 'not_lifting' && (
        <div className="mb-6 transition-opacity duration-300 ease-in-out">
          <h4 className="text-lg font-semibold mb-3 text-[#29234b]">Not Lifting Options:</h4>
          <select
            value={subOption}
            onChange={handleSubOptionChange}
            className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
          >
            <option value="" disabled>-- Select Sub Option --</option>
            <option value="busy">Busy</option>
            <option value="call_back">Call Back</option>
          </select>
        </div>
      )}

      {/* Sub-options for 'No Connected' */}
      {selectedOption === 'no_connected' && (
        <div className="mb-6 transition-opacity duration-300 ease-in-out">
          <h4 className="text-lg font-semibold mb-3 text-[#29234b]">No Connected Options:</h4>
          <select
            value={subOption}
            onChange={handleSubOptionChange}
            className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
          >
            <option value="" disabled>-- Select Sub Option --</option>
            <option value="switch_off">Switch Off</option>
            <option value="network_error">Network Error</option>
          </select>
        </div>
      )}
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

      {subOption === 'interested' && (
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
      )}

      <div className="mb-6 transition-opacity duration-300 ease-in-out">
        <h4 className="text-lg font-semibold mb-3 text-[#29234b]">Message</h4>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
          rows="4"
          name="message"
          placeholder="Please describe the issue..."
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

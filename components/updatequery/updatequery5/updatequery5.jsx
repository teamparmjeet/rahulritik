import React, { useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UpdateQuery5({ query, audit }) {
  const { data: session } = useSession();
  const queryid = query._id;
  const userid = query.userid;
  const [connectionOption, setConnectionOption] = useState('');

  const [selectedOption, setSelectedOption] = useState('');
  const [message, setMessage] = useState('');
  const [deadline, setDeadline] = useState('');
  const [grade, setGrade] = useState('Null'); // New state for grade
  const router = useRouter();

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

    // Prepare data to send to the backend for the audit update
    const data = {
      queryId: queryid,
      actionby: session?.user?.name,
      connectionStatus: connectionOption,
      oflinesubStatus: selectedOption,
      message: message,
      stage: selectedOption === 'visited' ? 6 : undefined, // Update stage to 6 if 'visited' is selected
      deadline: deadline || undefined, // Include deadline if provided
      grade: grade, // Include grade in the data
    };

    // Handle status counts
    const statusCountsUpdate = {
      interested_but_not_proper_response: audit?.statusCounts?.interested_but_not_proper_response || 0,
    };

    // Update the count for 'interested_but_not_proper_response' like statuses
    if (['no_visit_branch_yet', 'not_confirmed_yet'].includes(selectedOption)) {
      statusCountsUpdate.interested_but_not_proper_response += 1;
    }

    // Add the updated status counts to the data object
    data.statusCounts = statusCountsUpdate;

    try {
      // API call for audit update
      const auditResponse = await axios.patch('/api/audit/update', data);
      if (auditResponse.status === 200) {
        console.log('Audit updated successfully:', auditResponse.data);
        router.push("./")

        // window.location.reload();
      } else {
        console.error('Error updating audit:', auditResponse.statusText);
      }

      // Handle 'visited' (stage 6) and 'not_interested' (auto-close) options separately
      if (selectedOption === 'visited') {
        const queryUpdateData = {
          id: queryid,
          stage: 6, // Update stage to 6 when 'visited' is selected
        };
        const queryResponse = await axios.patch('/api/queries/update', queryUpdateData);
        if (queryResponse.status === 200) {
          console.log('Query updated successfully for visited:', queryResponse.data);
        } else {
          console.error('Error updating query for visited:', queryResponse.statusText);
        }
      }
      // Auto-close query if 'not_interested' is selected
      else if (selectedOption === 'not_interested') {
        const queryUpdateData = {
          id: queryid,
          autoclosed: 'close'
        };

        const queryResponse = await axios.patch('/api/queries/update', queryUpdateData);
        if (queryResponse.status === 200) {
          console.log('Query autoclosed successfully:', queryResponse.data);
        } else {
          console.error('Error autoclosed query:', queryResponse.statusText);
        }
      }
      // Auto-close query if status count threshold is reached for 'no_visit_branch_yet' or 'not_confirmed_yet'
      else if (
        ['no_visit_branch_yet', 'not_confirmed_yet','interested_but_not_proper_response'].includes(selectedOption) &&
        statusCountsUpdate.interested_but_not_proper_response >= 3
      ) {
        const queryUpdateData = {
          id: queryid,
          autoclosed: 'close'
        };

        const queryResponse = await axios.patch('/api/queries/update', queryUpdateData);
        if (queryResponse.status === 200) {
          console.log('Query autoclosed successfully after status count:', queryResponse.data);
        } else {
          console.error('Error autoclosing query after status count:', queryResponse.statusText);
        }
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

      {connectionOption === 'no_connected' && (

<div className="mb-6">
  <label htmlFor="statusSelect" className="block text-lg font-medium text-gray-700 mb-2">
    Reason:
  </label>
  <select
    id="statusSelect"
    value={selectedOption}
    onChange={handleOptionChange}
    className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
  >
    <option value="" disabled>-- Select Interested Status --</option>
    <option value="no_visit_branch_yet">Switch Off </option>
    <option value="no_visit_branch_yet">Network Error</option>
    <option value="no_visit_branch_yet">Other</option>
  </select>
</div>
)}

{connectionOption === 'not_lifting' && (

<div className="mb-6">
  <label htmlFor="statusSelect" className="block text-lg font-medium text-gray-700 mb-2">
    Reason:
  </label>
  <select
    id="statusSelect"
    value={selectedOption}
    onChange={handleOptionChange}
    className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
  >
    <option value="" disabled>-- Select Interested Status --</option>
    <option value="no_visit_branch_yet">Busy</option>
    <option value="no_visit_branch_yet">Other</option>
  </select>
</div>
)}
      {connectionOption === 'connected' && (
      <div className="mb-6">
        <label htmlFor="statusSelect" className="block text-lg font-medium text-gray-700 mb-2">
          Status:
        </label>
        <select
          id="statusSelect"
          value={selectedOption}
          onChange={handleOptionChange}
          className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#29234b] focus:border-[#29234b]"
        >
          <option value="" disabled>-- Select Status --</option>
          <option value="visited">Visited</option>
          <option value="no_visit_branch_yet">No Visit to Branch Yet</option>
          <option value="not_interested">Not Interested</option>
          <option value="not_confirmed_yet">Not Confirmed Yet</option>
          <option value="response">Response</option>
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
      {connectionOption === 'connected' && (
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

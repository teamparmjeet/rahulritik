import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession} from 'next-auth/react';

export default function UpdateQuery({ isOpen, onClose, initialData = {}, refreshData }) {
  const [currentStage, setCurrentStage] = useState('Stage 1');
  const [callHandlingStatus, setCallHandlingStatus] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [leadQualification, setLeadQualification] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(''); // For branch selection
  const [branchData, setBranchData] = useState([]); // Store fetched branch data
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { data: session } = useSession();

  // Function to fetch branch data
  const fetchBranchData = async () => {
    try {
      const response = await axios.get('/api/branch/fetchall/branch');
      setBranchData(response.data.fetch); // Assuming response.data contains the branch array
    } catch (error) {
      console.error('Error fetching branch data:', error);
    }
  };

  // Fetch branch data when "Not Connected 3" is selected
  useEffect(() => {
    if (connectionStatus === 'Not Connected 3') {
      fetchBranchData(); // Fetch branch data when the user selects Not Connected 3
    }
  }, [connectionStatus]);

  // Handling stage progress
  const handleStageChange = (stage) => {
    setCurrentStage(stage);
  };

  // Function to update the query
  const handleUpdateQuery = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Determine the autoclosed value based on callHandlingStatus
      const autoclosedValue = callHandlingStatus === 'RNR3' ? 'close' : 'open';
  
      // Prepare the payload object
      const payload = {
        id: initialData._id,
        callStage: callHandlingStatus,
        connectionStatus,
        leadStatus: leadQualification,
        notes,
        autoclosed: autoclosedValue,
        actionBy: session?.user?.name, // replace with the actual admin ID
      };
  
      // Conditionally add the branch if selectedBranch is not empty
      if (selectedBranch) {
        payload.branch = selectedBranch;
      }
  
      const response = await axios.patch('/api/queries/update', payload);
  
      setMessage(response.data.message);
      refreshData(); // Call refreshData to update the displayed data
      onClose(); // Close the modal after successful update
    } catch (error) {
      setMessage('Error updating query: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  

  // Rendering Call Handling options
  const renderCallHandling = () => (
    <>
      <h3 className="text-lg font-semibold mb-4">Stage 1: Call Handling</h3>
      <select
        value={callHandlingStatus}
        onChange={(e) => setCallHandlingStatus(e.target.value)}
        className="block w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
      >
        <option value="">Select Status</option>
        <option value="Not Lifting the Call">Not Lifting the Call (Busy, Call Back)</option>
        <option value="RNR1">RNR1</option>
        <option value="RNR2">RNR2</option>
        <option value="RNR3">RNR3 (Auto-Closure)</option>
      </select>

      {callHandlingStatus === 'RNR3' && (
        <p className="text-red-500 mb-4">This query will be auto-closed and moved to spam.</p>
      )}
      
      {callHandlingStatus && (
        <button
          onClick={() => handleStageChange('Stage 2')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          Next: Connection Status
        </button>
      )}
    </>
  );

  // Rendering Connection Status options
  const renderConnectionStatus = () => (
    <>
      <h3 className="text-lg font-semibold mb-4">Stage 2: Connection Status</h3>
      <select
        value={connectionStatus}
        onChange={(e) => setConnectionStatus(e.target.value)}
        className="block w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
      >
        <option value="">Select Connection Status</option>
        <option value="Not Connected 1">Not Connected 1</option>
        <option value="Not Connected 2">Not Connected 2</option>
        <option value="Not Connected 3">Not Connected 3 (Auto-Transfer)</option>
        <option value="Connection Established">Connection Established</option>
      </select>

      {connectionStatus === 'Not Connected 3' && (
        <>
          <p className="text-red-500 mb-4">This query will be transferred to another branch.</p>
          
          {/* Branch selection */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="block w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          >
            <option value="">Select Branch</option>
            <option value="Tifa Education">Main Branch</option>
            {branchData.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
        </>
      )}

      {connectionStatus === 'Connection Established' && (
        <button
          onClick={() => handleStageChange('Stage 3')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          Next: Lead Qualification
        </button>
      )}
    </>
  );

  // Rendering Lead Qualification options
  const renderLeadQualification = () => (
    <>
      <h3 className="text-lg font-semibold mb-4">Stage 3: Lead Qualification</h3>
      <select
        value={leadQualification}
        onChange={(e) => setLeadQualification(e.target.value)}
        className="block w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
      >
        <option value="">Select Lead Status</option>
        <option value="Wrong Number/Job Seeker">Wrong Number/Job Seeker (Trash)</option>
        <option value="Not Interested in Course">Not Interested in Course (Trash)</option>
        <option value="Interested in Course">Interested in Course</option>
      </select>

      {leadQualification === 'Interested in Course' && (
        <>
          <p className="mb-2 font-semibold">Select the course type:</p>
          <select
            className="block w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          >
            <option value="Offline">Offline Course</option>
            <option value="Online">Online Course</option>
          </select>

          <p className="mb-2 font-semibold">Select follow-up type if applicable:</p>
          <select
            className="block w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          >
            <option value="Visited & Interested">Visited & Interested (Enrolled)</option>
            <option value="Visited but Not Interested">Visited but Not Interested (Closed after two follow-ups)</option>
            <option value="Branch Not Visited">Branch Not Visited (Closed after two follow-ups)</option>
          </select>
        </>
      )}
    </>
  );

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 mb-4"
        >
          &times; Close
        </button>

        {currentStage === 'Stage 1' && renderCallHandling()}
        {currentStage === 'Stage 2' && renderConnectionStatus()}
        {currentStage === 'Stage 3' && renderLeadQualification()}

        {/* Notes Input */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Notes:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
            rows="3"
            placeholder="Add any notes here..."
          ></textarea>
        </div>

        <button
          onClick={handleUpdateQuery}
          disabled={loading}
          className={`mt-4 px-4 py-2 ${loading ? 'bg-gray-500' : 'bg-green-600'} text-white rounded-md hover:bg-green-700 transition duration-200`}
        >
          {loading ? 'Updating...' : 'Update Query'}
        </button>

        {message && (
          <div className={`mt-4 text-center ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </div>
        )}
        
        <button
          onClick={refreshData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          Refresh Data
        </button>
      </div>
    </div>
  ) : null;
}

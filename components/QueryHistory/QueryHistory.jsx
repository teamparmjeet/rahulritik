import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '@/components/Loader/Loader';
import { ArrowRight, Clock, FileText, UserCheck } from 'lucide-react';

export default function QueryHistory({ initialData }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState(null);
  const id = initialData._id;

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/admin/fetchall/admin');
        setUsers(response.data.fetch);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch audit data
  useEffect(() => {
    const fetchAuditData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/audit/findsingle/${id}`);
        setAudit(response.data);
      } catch (error) {
        console.error('Error fetching audit data:', error);
        setError('Failed to fetch audit data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditData();
  }, [id]);

  // Get user name by ID
  const getUserNameById = (userId) => {
    const user = users.find((user) => user._id === userId);
    return user ? user.name : userId; // Return the user's name or the ID if not found
  };

  // Map stages to more readable names
  const getStageName = (stage) => {
    const stages = {
      '0': 'Initial Stage',
      '1': 'Interested',
      '2': 'Online Admission Process',
      '3': 'Offline Admission',
      '4': 'Student Enrolled',
      '5': 'Visit',
      '6': 'Offline Admission Last Step',
    };
    return stages[stage] || 'Unknown Stage';
  };

  const formatFieldValue = (value) => {
    // Check if the value is a user ID and get the corresponding user name
    const userName = getUserNameById(value);
    if (userName !== value) return userName; // If it's a user ID, return the user's name

    // If it's a string but not a user ID, format it normally
    if (typeof value === 'string') {
      return value
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    return value;
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="mx-auto ">
      <h2 className="text-3xl font-extrabold mb-6 text-[#29234b] tracking-wide flex items-center gap-4">
        <FileText className="text-[#6cb049] animate-bounce" size={32} />
        <span className="bg-gradient-to-r from-[#29234b] to-[#6cb049] text-transparent bg-clip-text">
          Query History
        </span>
      </h2>

      {audit && audit.history.length > 0 ? (
        <div className="space-y-8">
         {
  audit.history
    .slice()
    .reverse()
    .map((entry, index) => (
      <div
        key={index}
        className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex justify-between items-center"
      >
        {/* User and Action */}
        <div className="flex items-center gap-4">
          <UserCheck size={20} className="text-[#6cb049]" />
          <span className="text-gray-800 font-semibold">
            {getUserNameById(entry.actionBy)} {entry.action} Query
          </span>
        </div>

        {/* Date */}
        <p className="text-gray-400 text-sm italic flex items-center gap-2">
          <Clock size={14} />
          {new Date(entry.actionDate).toLocaleString()}
        </p>

        {/* Current Stage */}
        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
          <strong>Stage:</strong> {getStageName(entry.stage)}
        </span>

        {/* Changes Summary */}
        <div className="flex flex-col items-start text-sm">
          {Object.keys(entry.changes)
            .filter(
              (field) =>
                field !== 'statusCounts' &&
                (entry.changes[field].oldValue || entry.changes[field].newValue)
            )
            .map((field, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="font-semibold capitalize">{field}:</span>
                <span className="text-red-500 line-through">
                  {formatFieldValue(entry.changes[field].oldValue)}
                </span>
                <span className="text-green-500">
                  {formatFieldValue(entry.changes[field].newValue)}
                </span>
              </div>
            ))}
          {Object.keys(entry.changes)
            .filter((field) => field !== 'statusCounts')
            .every(
              (field) =>
                !entry.changes[field].oldValue && !entry.changes[field].newValue
            ) && (
            <span className="text-gray-400 italic text-xs">No changes</span>
          )}
        </div>
      </div>
    ))
}

        </div>
      ) : (
        <p className="text-gray-500 text-center">No history available for this query.</p>
      )}
    </div>
  );
}

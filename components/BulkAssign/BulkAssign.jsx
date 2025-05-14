import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export default function BulkAssign({ initialData, data }) {
  const [assignedToreq, setAssignedToreq] = useState(initialData.assignedToreq);
  const [assignedUserDetails, setAssignedUserDetails] = useState(null);
  const [matchorignaluser, setMatchorignaluser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const { data: session } = useSession();
  const [adminid, setadminid] = useState(null);
  const [adminbranch, setAdminbranch] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/admin/find-admin-byemail/${session?.user?.email}`
        );
        setadminid(response.data._id);
        setAdminbranch(response.data.branch);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) fetchAdminData();
  }, [session]);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/admin/fetchall/admin');
        const allUsers = response.data.fetch;

        setUsers(allUsers);
        setFilteredUsers(allUsers);

        const matchedUser = allUsers.find(user => user._id === initialData.assignedToreq);
        const matchOriginalUser = allUsers.find(user => user._id === initialData.userid);

        setAssignedUserDetails(matchedUser || null);
        setMatchorignaluser(matchOriginalUser || null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [initialData.assignedToreq, initialData.userid]);

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // const adminId = matchorignaluser;
      const assignedUserId = assignedToreq;

      const updatePromises = initialData.ids.map(async (id) => {
        await axios.patch('/api/queries/update', {
          id,
          lastbranch: adminbranch,
          assignedToreq,
          assignedsenthistory: adminid,
          assignedreceivedhistory: [assignedUserId],
          assignedTostatus: true,
          actionBy: session?.user?.name,
          assigneddate: new Date().toISOString(),
        });

        await axios.patch('/api/audit/update', {
          queryId: id,
          message,
          assignedToreq,
          assignedBy: session?.user?.name,
        });
      });

      await Promise.all(updatePromises);

      const updatedUser = users.find(user => user._id === assignedToreq);
      setAssignedUserDetails(updatedUser || null);
      setSuccess('All queries updated successfully');
      window.location.reload();
    } catch (err) {
      console.error('Error updating queries:', err);
      setError('Failed to update one or more queries');
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectUser = (user) => {
    setAssignedToreq(user._id);
    setAssignedUserDetails(user);
    setIsDropdownOpen(false);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(term) ||
      user.branch.toLowerCase().includes(term) ||
      (user.usertype === "0" && "staff".includes(term)) ||
      (user.usertype === "1" && "branch Admin".includes(term)) ||
      (user.usertype === "2" && "staff".includes(term))
    );

    setFilteredUsers(filtered);
    setIsDropdownOpen(term.length > 0);
  };

  return (
    <div>
      <div className="bg-white rounded-lg  max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Bulk Assign</h2>
        {/* <p>Data IDs: {data.ids.join(', ')}</p> */}

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by name, branch, or user type"
            className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <button
            onClick={toggleDropdown}
            className="block w-full p-2 border border-gray-300 bg-gray-100 rounded focus:outline-none hover:bg-gray-200 transition duration-200"
          >
            {assignedUserDetails ? assignedUserDetails.name : "Select a user"}
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
              {filteredUsers.filter(user => user.usertype !== "2" && user._id !== adminid && user.status !== false).length > 0 ? (
                filteredUsers
                  .filter(user => user.usertype !== "2" && user._id !== adminid)
                  .map((user) => (
                    <div
                      key={user._id}
                      onClick={() => selectUser(user)}
                      className="p-4 cursor-pointer hover:bg-gray-100 transition duration-200"
                    >
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-600">Branch: {user.branch}</p>
                      <p className="text-sm text-gray-600">User Type: {user.usertype === "0" ? "Staff" : user.usertype === "1" ? "Branch Admin" : "Staff"}</p>
                    </div>
                  ))
              ) : (
                <p className="p-4 text-sm text-gray-500">No users found</p>
              )}
            </div>
          )}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message..."
          className="w-full p-2 border border-gray-300 rounded mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-4 py-2 bg-[#6cb049] text-white rounded disabled:bg-green-300 transition duration-200"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full" />
                Updating...
              </span>
            ) : (
              'Update'
            )}
          </button>
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-500 mt-4">{success}</p>}
      </div>
    </div>
  );
}

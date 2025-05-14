import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export default function AssignedQuery({ initialData, refreshData }) {
    const [assignedToreq, setAssignedToreq] = useState(initialData.assignedToreq);
    const [orignaluser, setOrignaluser] = useState(initialData.userid);
    const [assignedUserDetails, setAssignedUserDetails] = useState(null);
    const [matchorignaluser, setMatchorignaluser] = useState(null);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState(''); // State for the message
    const { data: session } = useSession();
    const [adminid, setAdminid] = useState(null);
    const [adminbranch, setAdminbranch] = useState(null);
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true);  // Start loading
                const response = await axios.get(
                    `/api/admin/find-admin-byemail/${session?.user?.email}`
                );

                setAdminid(response.data._id);
                setAdminbranch(response.data.branch)

            } catch (err) {
                
            } finally {
                setLoading(false);  // Stop loading
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

                // Set user data and filtered users
                setUsers(allUsers);
                setFilteredUsers(allUsers);

                // Find assigned user
                const matchedUser = allUsers.find(user => user._id === initialData.assignedToreq);
                const matchOriginalUser = allUsers.find(user => user._id === initialData.userid);

                setAssignedUserDetails(matchedUser || null); // Set matched user or null
                setMatchorignaluser(matchOriginalUser || null); // Set matchOriginalUser or null
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to fetch user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [initialData.assignedToreq, initialData.userid]);
    const displayName = matchorignaluser?.name || '...';


    const handleUpdate = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
           
            const assignedUserId = assignedToreq; // The ID of the assigned user

            // Update query assignment with actionBy (who is performing the update)
            const queryResponse = await axios.patch('/api/queries/update', {
                id: initialData._id,
                lastbranch:adminbranch,
                assignedToreq,
                assignedsenthistory: adminid,
                assignedreceivedhistory: [assignedUserId], // Add assigned user ID to received history
                assignedTostatus: true,
                actionBy: session?.user?.name,
                assigneddate: new Date().toISOString()
            });

            // Update audit log with actionBy, assignedBy, and message
            const auditResponse = await axios.patch('/api/audit/update', {
                queryId: initialData._id,
                message,
                assignedToreq,
                assignedBy: session?.user?.name,
            });

            if (queryResponse.status === 200 && auditResponse.status === 200) {
                const updatedUser = users.find(user => user._id === assignedToreq);
                setAssignedUserDetails(updatedUser || null);
                setSuccess('Query, message, and assignment details updated successfully');
                refreshData();
                setIsEditing(false);
            }
        } catch (err) {
            setError('Failed to update query, message, or assignment details');
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
            <div className=" mx-auto bg-white max-w-sm mb-1">


                <button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#6cb049]   hover:bg-[#5aa43f] mb-2  w-full py-1 rounded-md text-white"
                >
                    Assign
                </button>

                {assignedUserDetails ? (
                    <div>
                        <p className="text-sm text-gray-800 bg-gray-200 px-1 rounded-md">
                            <span className="font-semibold ">Assigned to:</span> {assignedUserDetails.name || 'No user assigned'}
                        </p>
                        {/* <p className="text-sm">
                            <span className="font-semibold">Branch:</span> {assignedUserDetails.branch || 'N/A'}
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">Role:</span> {assignedUserDetails.usertype === "0" ? "Admin" : assignedUserDetails.usertype === "1" ? "Manager" : "Staff"}
                        </p> */}
                    </div>
                ) : (
                    <p className="text-sm  text-gray-500">Created by : {displayName}</p>
                )}
            </div>

            {isEditing && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-semibold mb-4">Update Assigned User & Message</h2>

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

                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>

                        {error && <p className="text-red-500 mt-4">{error}</p>}
                        {success && <p className="text-green-500 mt-4">{success}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

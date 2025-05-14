import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Loader from '@/components/Loader/Loader';
import Updatequery from '@/components/updatequery/updatequery/Updatequery';
import Updatequery1 from '@/components/updatequery/updatequery1/Updatequery1';
import Updatequery2 from '@/components/updatequery/updatequery2/updatequery2';
import Updatequery3 from '@/components/updatequery/updatequery3/updatequery3';
import Updatequery4 from '@/components/updatequery/updatequery4/updatequery4';
import Updatequery5 from '@/components/updatequery/updatequery5/updatequery5';
import Updatequery6 from '@/components/updatequery/updatequery6/updatequery6';

export default function UpdateQuery({ isOpen, onClose, initialData = {}, refreshData }) {
  const { data: session } = useSession();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const id = initialData._id;

  useEffect(() => {
    const fetchAuditData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null); // Reset error before fetching
      try {
        const response = await axios.get(`/api/audit/findsingle/${id}`);
        console.log("Response:", response.data); // Log the response data
        setAudit(response.data);
      } catch (error) {
        console.error("Error fetching audit data:", error);
        setError("Failed to fetch audit data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && id) {
      fetchAuditData();
    }
  }, [id, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg h-svh overflow-auto">
        <div className=" flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Update Query</h2>
          <button
            onClick={onClose}
            className=" py-0.5 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Close
          </button>
        </div>


        {loading ? (
          <div className=" w-full flex justify-center">
            <Loader />
          </div>
        ) : error ? (

          <div className="text-red-500">{error}</div>
        ) : (

          <>
            {/* <div className="mb-2">
              <span className="font-semibold">ID:</span> {initialData._id || "N/A"}
            </div> */}

            <div className="mb-2">
              {/* <span className="font-semibold">Stage:</span> {audit.stage} */}

              {audit.stage === 0 && <Updatequery query={initialData} audit={audit} />}
              {audit.stage === 1 && <Updatequery1 query={initialData} audit={audit} />}
              {audit.stage === 2 && <Updatequery2 query={initialData} audit={audit} />}
              {audit.stage === 3 && <Updatequery3 query={initialData} audit={audit} />}
              {audit.stage === 4 && <Updatequery4 query={initialData} audit={audit} />}
              {audit.stage === 5 && <Updatequery5 query={initialData} audit={audit} />}
              {audit.stage === 6 && <Updatequery6 query={initialData} audit={audit} />}

            </div>

          </>
        )}



      </div>
    </div>
  );
}

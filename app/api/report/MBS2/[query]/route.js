import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";
import AdminModel from "@/model/Admin";

export const GET = async () => {
    await dbConnect();

    try {
        // Fetch all queries and admins
        const queries = await QueryModel.find({});
        const admins = await AdminModel.find({}, { _id: 1, name: 1, branch: 1 });

        // Create a map of admin IDs to names
        const adminIdToName = admins.reduce((map, admin) => {
            map[admin._id.toString()] = admin.name;
            return map;
        }, {});

        // Calculate sent and received counts along with query details
        const sentReceivedCounts = admins.reduce((counts, admin) => {
            const adminId = admin._id.toString();
            counts[adminId] = {
                sent: 0,
                received: 0,
                sentQueryDetails: [],
                receivedQueryDetails: []
            };

            queries.forEach(query => {
                // Check if the admin is in the sent history
                if (query.assignedsenthistory.includes(adminId)) {
                    counts[adminId].sent++;
                    counts[adminId].sentQueryDetails.push({
                        queryId: query._id,
                        queryDetails: {
                            ...query._doc,
                            assignedsenthistory: query.assignedsenthistory.map(id => adminIdToName[id] || id),
                            assignedreceivedhistory: query.assignedreceivedhistory.map(id => adminIdToName[id] || id)
                        }
                    });
                }

                // Check if the admin is in the received history
                if (query.assignedreceivedhistory.includes(adminId)) {
                    counts[adminId].received++;
                    counts[adminId].receivedQueryDetails.push({
                        queryId: query._id,
                        queryDetails: {
                            ...query._doc,
                            assignedsenthistory: query.assignedsenthistory.map(id => adminIdToName[id] || id),
                            assignedreceivedhistory: query.assignedreceivedhistory.map(id => adminIdToName[id] || id)
                        }
                    });
                }
            });

            return counts;
        }, {});

        // Prepare user activity report including full query details
        const userActivityReport = admins.map(admin => {
            const adminId = admin._id.toString();
            return {
                userName: admin.name,
                branch: admin.branch,
                sentQueries: sentReceivedCounts[adminId]?.sent || 0,
                receivedQueries: sentReceivedCounts[adminId]?.received || 0,
                sentQueryDetails: sentReceivedCounts[adminId]?.sentQueryDetails || [],
                receivedQueryDetails: sentReceivedCounts[adminId]?.receivedQueryDetails || [],
            };
        });

        return Response.json({
            message: "Enhanced audit log analysis fetched successfully!",
            success: true,
            data: { userActivityReport },
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching data:", error);
        return Response.json({
            message: "Error fetching report!",
            success: false,
        }, { status: 500 });
    }
};

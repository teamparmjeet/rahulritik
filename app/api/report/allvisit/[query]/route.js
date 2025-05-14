import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";
import AuditModel from "@/model/AuditLog";
import AdminModel from "@/model/Admin";

export const GET = async (request) => {
    await dbConnect();

    try {
        // Step 1: Fetch all unique queryIds from the AuditLog where stage is 6
        const auditLogs = await AuditModel.find({ stage: 6 }).select('queryId grade stage history');

        // Step 2: Create a map of queryIds to their corresponding grades and transition dates
        const queryIdMap = {};
        const stageTransitionDates = {}; // Map to store the transition dates
        
        auditLogs.forEach(log => {
            queryIdMap[log.queryId] = log.grade;
        
            // Find the index of the entry where stage is "6"
            const stage6Index = log.history.findIndex(exit => exit.stage === "6");
        
            if (stage6Index > 0) { 
                // If there is a previous entry before stage "6"
                const prevAuditLog = log.history[stage6Index - 1]; 
                const transitionDate = new Date(prevAuditLog.actionDate);
                stageTransitionDates[log.queryId] = `${transitionDate.getDate()}-${transitionDate.getMonth() + 1}-${transitionDate.getFullYear()}`;
            } else if (log.history.length > 0) { 
                // If there's no stage "6", use the latest available action date
                const latestAuditLog = log.history[log.history.length - 1]; 
                const transitionDate = new Date(latestAuditLog.actionDate);
                stageTransitionDates[log.queryId] = `${transitionDate.getDate()}-${transitionDate.getMonth() + 1}-${transitionDate.getFullYear()}`;
            }
        });

        // Step 3: Extract the queryIds from the audit logs
        const queryIds = auditLogs.map(log => log.queryId);

        // Step 4: Fetch the queries from QueryModel where _id is in the list of queryIds
        const queries = await QueryModel.find({ _id: { $in: queryIds }, defaultdata: "query" });

        // Step 5: Fetch admin names for all userIds in the queries
        const userIds = queries.map(query => query.userid);
        const admins = await AdminModel.find({ _id: { $in: userIds } }).select('name');

        // Step 6: Create a map of userId to admin name
        const adminMap = {};
        admins.forEach(admin => {
            adminMap[admin._id] = admin.name;
        });

        // Step 7: Map the queries to include the grade from AuditLog and admin name
        const result = queries.map(query => ({
            ...query.toObject(),
            grade: queryIdMap[query._id], // Add grade from audit log
            adminName: adminMap[query.userid] || null, // Add admin name
            transitionDate: stageTransitionDates[query._id] || null, // Add formatted transition date (if any)
        }));

        return Response.json(
            {
                message: "Filtered data fetched successfully!",
                success: true,
                queries: result,
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("Error fetching data list:", error);
        return Response.json(
            {
                message: "Error on fetching data list!",
                success: false,
            },
            { status: 500 }
        );
    }
};

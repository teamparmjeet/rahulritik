import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";
import AuditModel from "@/model/AuditLog";
import AdminModel from "@/model/Admin";

export const GET = async (request) => {
    await dbConnect();

    try {
        // Step 1: Fetch the queries matching the criteria
        const queries = await QueryModel.find({ addmission: true });

        // Step 2: Fetch audit logs for the fetched query IDs
        const queryIds = queries.map((query) => query._id.toString());
        const auditLogs = await AuditModel.find({ queryId: { $in: queryIds } });

        // Step 3: Fetch admin details for the user IDs in the queries
        const userIds = queries.map((query) => query.userid).filter(Boolean); // Collect all user IDs
        const adminDetails = await AdminModel.find({ _id: { $in: userIds } }).select("_id name");

        // Create a map of admin ID to name for quick lookup
        const adminMap = adminDetails.reduce((map, admin) => {
            map[admin._id.toString()] = admin.name;
            return map;
        }, {});

        
        const queriesWithDetails = queries.map((query) => {
            // Find the corresponding audit log
            const log = auditLogs.find((log) => log.queryId === query._id.toString());

         
            const admissionupdate = log?.history?.find((entry) => entry.oflinesubStatus === "admission");

            
            return {
                ...query.toObject(),
                admissionupdatedate: admissionupdate?.actionDate || null,
                staffName: adminMap[query.userid] || null, // Get the user name or null if not found
            };
        });

        // Step 5: Structure the response
        return Response.json(
            {
                message: "All data fetched!",
                success: true,
                fetch: queriesWithDetails,
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("Error on getting data list:", error);
        return Response.json(
            {
                message: "Error on getting data list!",
                success: false,
            },
            { status: 500 }
        );
    }
};

import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";
import QueryUpdateModel from "@/model/AuditLog"; // Import the audit log model

export async function POST(req, res) {
    await dbConnect();

    try {
        const query = await req.json();

        // Create and save the new query
        const newQuery = new QueryModel(query);
        await newQuery.save();

        // Create an audit log entry with the queryId
        const auditLogEntry = new QueryUpdateModel({
            queryId: newQuery._id, // Add the newly created query's ID to the audit log
        
        });

        // Save the audit log entry
        await auditLogEntry.save();

        return Response.json({
            message: "Query and Audit Log Added Successfully",
            success: true,
            queryId: newQuery._id 
        }, { status: 200 });

    } catch (error) {
        return Response.json({
            success: false,
            message: error.message
        });
    }
}

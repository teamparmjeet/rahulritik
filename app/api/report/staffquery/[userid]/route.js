import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";
import AuditModel from "@/model/AuditLog";

export const GET = async (request, context) => {
    await dbConnect();
    const userid = context.params.userid;

    try {
        // Fetch queries based on userid
        const queries = await QueryModel.find({ userid: userid });

        // Fetch the latest stage from AuditModel for each query
        const queriesWithStage = await Promise.all(
            queries.map(async (query) => {
                const latestAudit = await AuditModel.findOne({ queryId: query._id })
                    .sort({ createdAt: -1 }) // Assuming timestamps exist
                    .select("stage");
                
                return {
                    ...query.toObject(),
                    stage: latestAudit ? latestAudit.stage : null, // Default to null if no audit found
                };
            })
        );

        return Response.json(
            {
                message: "Data fetched with latest stage included!",
                success: true,
                fetch: queriesWithStage,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching data list:", error);
        return Response.json(
            {
                message: "Error fetching data list!",
                success: false,
            },
            { status: 500 }
        );
    }
};

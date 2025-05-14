import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";

export const GET = async (request, context) => {
    await dbConnect();

    const { branchname } = context.params;  // Extract branchname from params
    const url = new URL(request.url);
    const userid = url.searchParams.get("_id"); // Extract _id from query parameters
    const autoclosedStatus = url.searchParams.get("autoclosed") || "open"; // Default to "open"

    if (!branchname || !userid) {
        return Response.json(
            {
                message: "Branch name or User ID is missing!",
                success: false,
            },
            { status: 400 }
        );
    }

    try {
        const fetch = await QueryModel.find({
            $and: [
                { addmission: false }, 
                {
                    $or: [
                        { assignedTo: userid },
                        { branch: branchname, assignedTo: "Not-Assigned" },
                        
                    ]
                }
            ],
            autoclosed: autoclosedStatus,
            demo:false
        });
        

        return Response.json(
            {
                message: "Data fetched successfully!",
                success: true,
                fetch,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching data:", error);
        return Response.json(
            {
                message: "Error fetching data!",
                success: false,
            },
            { status: 500 }
        );
    }
};

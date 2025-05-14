import dbConnect from "@/lib/dbConnect";
import QueryUpdateModel from "@/model/AuditLog";

export const GET = async (request) => {
    await dbConnect();

    try {
        // Fetch total number of queries excluding where defaultdata is "query"
        const fetch = await QueryUpdateModel.aggregate([
            {
                $match: { message: { $ne: "query" } }, // Exclude documents with defaultdata set to "query"
            },
            {
                $group: {
                    _id: null,
                    Total: { $sum: 1 }
                },
            },
            {
                $project: {
                    _id: 0,
                    Total: 1,
                },
            }
        ]);

        // Fetch date-wise update counts based on history.actionDate excluding defaultdata: "query"
        const dateWiseUpdates = await QueryUpdateModel.aggregate([
            {
                $match: { defaultdata: { $ne: "query" } }, // Exclude documents with defaultdata set to "query"
            },
            {
                $unwind: "$history" // Unwind the history array
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$history.actionDate" } }
                    },
                    updatedCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id.date",
                    updatedCount: 1,
                },
            },
            { $sort: { date: 1 } }  // Sort by date in ascending order
        ]);

        const result = fetch[0] || { Total: 0 };

        return Response.json(
            {
                message: "All data fetched!",
                success: true,
                data: {
                    totalQueries: result.Total,
                    dateWiseUpdates
                },
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

import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";

export const GET = async (request) => {
    await dbConnect();

    try {
        const fetch = await QueryModel.aggregate([
            {
                $match: { defaultdata: "query" },
            },
            {
                $group: {
                    _id: { 
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalQueries: { $sum: 1 }, 
                },
            },
            {
                $project: {
                    _id: 0,
                    totalQueries: 1,
                    year: "$_id.year",
                    month: { 
                        $arrayElemAt: [
                            ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                            { $subtract: ["$_id.month", 1] } 
                        ]
                    }
                },
            },
            {
                $sort: { year: 1, "month": 1 }
            }
        ]);

        return Response.json(
            {
                message: "All data fetched!",
                success: true,
                fetch,
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

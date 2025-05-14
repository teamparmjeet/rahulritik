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
                    _id: null, // Grouping everything together
                    Total: { $sum: 1 },
                    Pending: {
                        $sum: { $cond: [{ $eq: ["$addmission", false] }, 1, 0] }
                    },
                    Enrolled: {
                        $sum: { $cond: [{ $eq: ["$addmission", true] }, 1, 0] }
                    },
                    AutoClose: {
                        $sum: { $cond: [{ $eq: ["$autoclosed", "close"] }, 1, 0] }
                    }
                },
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field from the result
                   
                    Pending: 1,
                    Enrolled: 1,
                    AutoClose: 1,
                },
            }
        ]);

        // Ensure to send the relevant data for the pie chart
        const result = fetch[0] || { Total: 0, Pending: 0, Enrolled: 0, AutoClose: 0 };

        return Response.json(
            {
                message: "All data fetched!",
                success: true,
                fetch: [
                
                    {
                        label: "Pending Queries",
                        value: result.Pending,
                    },
                    {
                        label: "Enrolled Queries",
                        value: result.Enrolled,
                    },
                    {
                        label: "Auto Closed Queries",
                        value: result.AutoClose,
                    }
                ],
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

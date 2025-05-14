import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";

export const GET = async (request) => {
    await dbConnect();

    try {
        // Fetch only the phoneNumber field from the studentContact object
        const fetch = await QueryModel.find({ defaultdata: "query" }).select('studentContact.phoneNumber branch');

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

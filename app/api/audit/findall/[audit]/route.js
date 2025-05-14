import dbConnect from "@/lib/dbConnect";
import QueryUpdateModel from "@/model/AuditLog";

export const GET = async (request) => {
    await dbConnect();

    try {
        const fetch = await QueryUpdateModel.find({ autoClose: false }); // Modify the query to filter based on autoClose being false
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

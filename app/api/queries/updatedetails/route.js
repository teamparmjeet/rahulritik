import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";

export const PATCH = async (request) => {
    await dbConnect();
    try {
        const data = await request.json();
        
        // Find the existing query to ensure it exists and get current data
        const existingQuery = await QueryModel.findOne({ _id: data.id });

        if (!existingQuery) {
            return new Response(
                JSON.stringify({
                    message: "Received invalid Query id!",
                    success: false,
                }),
                { status: 404 }
            );
        }

        // Remove userid from the data to ensure it is not updated
        const { userid, ...updateData } = data;

        await QueryModel.updateOne(
            { _id: data.id },
            { $set: updateData }
        );

        return new Response(
            JSON.stringify({
                message: "Query updated!",
                success: true,
                Queryid: data.id,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.log("Error on updating Query:", error);
        return new Response(
            JSON.stringify({
                message: "Error on updating Query!",
                success: false,
            }),
            { status: 500 }
        );
    }
};

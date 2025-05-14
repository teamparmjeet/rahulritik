import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";

export const GET = async (request, context) => {
    await dbConnect();
    const userid = context.params.userid;
    
    // Parse the query parameters from the request URL
    const url = new URL(request.url);

    try {
        // Fetch data dynamically based on the `autoclosed` status
        const fetch = await QueryModel.find({ 
            assignedToreq: userid, 
        });

        return Response.json(
            {
                message: "Data fetched dynamically based on autoclosed status!",
                success: true,
                fetch,
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("Error fetching data list:", error);
        return Response.json(
            {
                message: "Error fetching data list!",
                success: false,
            },
            { status: 500 }
        );
    }
};

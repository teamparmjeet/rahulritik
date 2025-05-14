import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";

export const GET = async (request, context) => {
    await dbConnect();
    const userid = context.params.userid;

    const url = new URL(request.url);
   
    const today = new Date().toISOString(); 
    console.log(today);
    
    try {
        // Modify the query to match both assignedTo and userid
        const fetch = await QueryModel.find({
            $or: [
                { assignedTo: userid }, // Match if assigned to the user
                { userid: userid }      // Match if the user is the creator
            ],
            autoclosed: "open",
            deadline: { $lte: today }
        });

        const count = fetch.length;

        return Response.json(
            {
                message: "Data fetched dynamically based on deadline and user!",
                success: true,
                count,
                data: fetch  // Optionally return the fetched data
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

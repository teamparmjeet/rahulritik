import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";

export const GET = async (request, context) => {
    await dbConnect();
    const userid = context.params.adminid;
    

    try {
      
        const fetch = await QueryModel.find({ 
            $or: [
                { userid: userid, assignedTo: "Not-Assigned" },      
                { assignedTo: userid }         
            ],
            addmission: true
        });

        return Response.json(
            {
                message: "Data fetched dynamically ",
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

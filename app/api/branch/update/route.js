import dbConnect from "@/lib/dbConnect";
import BranchModel from "@/model/Branch";

export const PATCH = async (request) => {
    await dbConnect();
    try {
        const data = await request.json();

        const branch = await BranchModel.findOne({ _id: data.id });

        if (!branch) {
            return new Response(
                JSON.stringify({
                    message: "Received invalid branch id!",
                    success: false,
                }),
                { status: 404 }
            );
        }

        await BranchModel.updateOne(
            { _id: data.id },
            { $set: data }   
        );

        return new Response(
            JSON.stringify({
                message: "branch updated!",
                success: true,
                branchid: data.id,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.log("Error on updating branch:", error);
        return new Response(
            JSON.stringify({
                message: "Error on updating branch!",
                success: false,
            }),
            { status: 500 }
        );
    }
};

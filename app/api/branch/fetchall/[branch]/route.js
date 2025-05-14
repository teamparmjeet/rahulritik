import dbConnect from "@/lib/dbConnect";
import BranchModel from "@/model/Branch";

export const GET = async (request) => {
    await dbConnect();

    try {
        const fetch = await BranchModel.find({ defaultdata: "branch" });
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

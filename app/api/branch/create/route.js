import dbConnect from "@/lib/dbConnect";
import BranchModel from "@/model/Branch";

export async function POST(req, res) {
    await dbConnect();

    try {
        const branch = await req.json();
        const newbranch = new BranchModel(branch);
        await newbranch.save();

        return Response.json({
            message: "branch Register",
            success: true,
            data: { id: newbranch._id }
        }, { status: 200 })
    } catch (error) {
        console.log(error)
        return Response.json({
            message: "error in branch Registeration",
            success: false
        }, { status: 500 })
    }
}
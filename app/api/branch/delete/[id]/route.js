import dbConnect from "@/lib/dbConnect";
import BranchModel from "@/model/Branch";


export const DELETE = async (request, context) => {
  await dbConnect();

  try {
    const id = context.params.id;

    if (!id) {
      return Response.json(
        {
          message: "branch id is required!",
          success: false,
        },
        { status: 400 }
      );
    }

    const branch = await BranchModel.findOne({ _id: id });

    if (!branch) {
      return Response.json(
        {
          message: "Received invalid branch id!",
          success: false,
        },
        { status: 400 }
      );
    }

    await branch.deleteOne();

    return Response.json(
      {
        message: "branch deleted!",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error on deleting branch:", error);
    return Response.json(
      {
        message: "Error on deleting branch!",
        success: false,
      },
      { status: 500 }
    );
  }
};
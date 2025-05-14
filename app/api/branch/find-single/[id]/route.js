import dbConnect from "@/lib/dbConnect";
import BranchModel from "@/model/Branch";


export const GET = async (request, context) => {
  await dbConnect();

  try {
    const id = context.params.id;
    const branch = await BranchModel.findById(id);

    if (!branch) {
      return Response.json(
        {
          message: "branch not found!",
          success: false,
        },
        { status: 404 }
      );
    }

    return Response.json(


      { branch: branch },

      { status: 200 }
    );
  } catch (error) {
    console.log("Error on getting branch:", error);
    return Response.json(
      {
        message: "Error on getting branch!",
        success: false,
      },
      { status: 500 }
    );
  }
};

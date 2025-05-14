import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";

export const DELETE = async (request, context) => {
  await dbConnect();

  try {
    const { ids } = await request.json(); // Assuming the request body contains either a single ID or an array of IDs

    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return Response.json(
        {
          message: "Branch ID or list of branch IDs is required!",
          success: false,
        },
        { status: 400 }
      );
    }

    // If a single ID is provided as a string, convert it to an array
    const branchIds = Array.isArray(ids) ? ids : [ids];

    // Check if all branch IDs are valid
    const branches = await QueryModel.find({ _id: { $in: branchIds } });

    if (branches.length !== branchIds.length) {
      return Response.json(
        {
          message: "Some branch IDs are invalid!",
          success: false,
        },
        { status: 400 }
      );
    }

    // Update the autoclosed field to 'close' for all specified branches
    await QueryModel.updateMany(
      { _id: { $in: branchIds } },
      { $set: { autoclosed: "close" } }
    );

    return Response.json(
      {
        message: `${branchIds.length > 1 ? "Branches" : "Branch"} updated to 'close' successfully!`,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error on updating branch(es):", error);
    return Response.json(
      {
        message: "Error on updating branch(es)!",
        success: false,
      },
      { status: 500 }
    );
  }
};

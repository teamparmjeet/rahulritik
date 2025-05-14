import dbConnect from "@/lib/dbConnect";
import ReferenceModel from "@/model/Reference";
import { ObjectId } from "mongodb"; // Ensure you're using ObjectId for valid MongoDB IDs

export const DELETE = async (request, context) => {
  await dbConnect();

  try {
    const id = context.params.id;

    // Validate that the id is a valid MongoDB ObjectId
    if (!id || !ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({
          message: "Invalid or missing reference ID!",
          success: false,
        }),
        { status: 400 }
      );
    }

    // Find and delete the reference in one step
    const deletedReference = await ReferenceModel.findByIdAndDelete(id);

    if (!deletedReference) {
      return new Response(
        JSON.stringify({
          message: "No reference found with the given ID!",
          success: false,
        }),
        { status: 404 }
      );
    }

    // Successfully deleted
    return new Response(
      JSON.stringify({
        message: "Reference deleted successfully!",
        success: true,
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error on deleting reference:", error);

    return new Response(
      JSON.stringify({
        message: "An error occurred while deleting the reference.",
        success: false,
        error: error.message, // Useful to show the actual error in development
      }),
      { status: 500 }
    );
  }
};

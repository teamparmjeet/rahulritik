import dbConnect from "@/lib/dbConnect";
import ReferenceModel from "@/model/Reference";
import { ObjectId } from "mongodb"; // Ensure you're using ObjectId for valid MongoDB IDs

export const PUT = async (request, context) => {
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

    // Parse the updated data from the request body
    const updatedData = await request.json();

    // Validate the updated data (ensure it contains valid fields)
    if (!updatedData.referencename || !updatedData.suboptions) {
      return new Response(
        JSON.stringify({
          message: "Missing required fields: referencename or suboptions!",
          success: false,
        }),
        { status: 400 }
      );
    }

    // Find and update the reference
    const updatedReference = await ReferenceModel.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validators are run on the updated data
    });

    if (!updatedReference) {
      return new Response(
        JSON.stringify({
          message: "No reference found with the given ID!",
          success: false,
        }),
        { status: 404 }
      );
    }

    // Successfully updated
    return new Response(
      JSON.stringify({
        message: "Reference updated successfully!",
        success: true,
        reference: updatedReference, // Optionally return the updated reference
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error on updating reference:", error);

    return new Response(
      JSON.stringify({
        message: "An error occurred while updating the reference.",
        success: false,
        error: error.message, // Useful to show the actual error in development
      }),
      { status: 500 }
    );
  }
};

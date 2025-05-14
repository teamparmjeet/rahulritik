import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/model/Courses";

export const DELETE = async (request, context) => {
  await dbConnect();

  try {
    const { id } = await request.json(); // Expecting a single course ID in the request body

    if (!id) {
      return Response.json(
        {
          message: "Course ID is required!",
          success: false,
        },
        { status: 400 }
      );
    }

    // Check if the course ID is valid
    const course = await CourseModel.findById(id);

    if (!course) {
      return Response.json(
        {
          message: "Invalid course ID!",
          success: false,
        },
        { status: 400 }
      );
    }

    // Delete the course
    await CourseModel.findByIdAndDelete(id);

    return Response.json(
      {
        message: "Course deleted successfully!",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error on deleting course:", error);
    return Response.json(
      {
        message: "Error on deleting course!",
        success: false,
      },
      { status: 500 }
    );
  }
};

import dbConnect from "@/lib/dbConnect";
import AdminModel from "@/model/Admin";

export async function GET(request, context) {
  await dbConnect();

  try {

    const emailid = context.params.emailid;


    const user = await AdminModel.findOne({ email: emailid });
    console.log("user")
    if (!user) {
      return Response.json(
        {
          message: "User not found!",
          success: false,
        },
        { status: 404 }
      );
    }

    return Response.json(user, { status: 200 });
  } catch (error) {
    console.log("Error on getting user:", error);
    return Response.json(
      {
        message: "Error on getting user!",
        success: false,
      },
      { status: 500 }
    );
  }
}

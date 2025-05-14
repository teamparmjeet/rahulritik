import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";


export const GET = async (request, context) => {
  await dbConnect();

  try {
    const id = context.params.id;
    const query = await QueryModel.findById(id);

    if (!query) {
      return Response.json(
        {
          message: "query not found!",
          success: false,
        },
        { status: 404 }
      );
    }

    return Response.json(


      { query: query },

      { status: 200 }
    );
  } catch (error) {
    console.log("Error on getting query:", error);
    return Response.json(
      {
        message: "Error on getting query!",
        success: false,
      },
      { status: 500 }
    );
  }
};

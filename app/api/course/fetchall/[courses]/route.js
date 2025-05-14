import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/model/Courses";

export const GET = async (request) => {
    await dbConnect();

    try {
        const fetch = await CourseModel.find({ defaultdata: "Courses" });
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

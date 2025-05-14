import dbConnect from "@/lib/dbConnect";
import CoursesCategoryModel from "@/model/CoursesCategory";

export const PATCH = async (request) => {
    await dbConnect();
    try {
        const data = await request.json();

        const course = await CoursesCategoryModel.findOne({ _id: data.id });

        if (!course) {
            return new Response(
                JSON.stringify({
                    message: "Received invalid course id!",
                    success: false,
                }),
                { status: 404 }
            );
        }

        await CoursesCategoryModel.updateOne(
            { _id: data.id },
            { $set: data }   
        );

        return new Response(
            JSON.stringify({
                message: "course updated!",
                success: true,
                courseid: data.id,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.log("Error on updating course:", error);
        return new Response(
            JSON.stringify({
                message: "Error on updating course!",
                success: false,
            }),
            { status: 500 }
        );
    }
};

import dbConnect from "@/lib/dbConnect";
import CoursesCategoryModel from "@/model/CoursesCategory";

export async function POST(req, res) {
    await dbConnect();

    try {
        const course = await req.json();
        const existingCourse = await CoursesCategoryModel.findOne({ category: course.category });

        if (existingCourse) {
            return new Response(JSON.stringify({
                message: "Category already exists",
                success: false
            }), { status: 400 });
        }

        const newcourse = new CoursesCategoryModel(course);
        await newcourse.save();

        return new Response(JSON.stringify({
            message: "Course registered successfully",
            success: true,
            data: { id: newcourse._id }
        }), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({
            message: "Error in course registration",
            success: false
        }), { status: 500 });
    }
}

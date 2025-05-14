import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/model/Courses";

export async function POST(req, res) {
    await dbConnect();

    try {
        const course = await req.json();
        const newcourse = new CourseModel(course);
        await newcourse.save();

        return Response.json({
            message: "course Register",
            success: true,
            data: { id: newcourse._id }
        }, { status: 200 })
    } catch (error) {
        console.log(error)
        return Response.json({
            message: "error in course Registeration",
            success: false
        }, { status: 500 })
    }
}
import mongoose, { Schema } from "mongoose";

const CoursesCategorySchema = new Schema(
    {
        category: { type: String, required: true ,unique: true},

        defaultdata: { type: String, required: true, default: "CoursesCategory" }

    },
    { timestamps: true }
);

const CoursesCategoryModel =
    mongoose.models.CoursesCategory1 || mongoose.model("CoursesCategory1", CoursesCategorySchema);

export default CoursesCategoryModel
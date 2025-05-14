import mongoose, { Schema } from "mongoose";

const BranchSchema = new Schema(
    {
        branch_name: { type: String, required: true },
        location: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
        },
        contactInfo: {
            phoneNumber: { type: String, required: true },
            email: { type: String, required: true },
        },
        courses: [{ type: String, required: true }],
        student_count: { type: String, required: true, default: "0" },
        staff_count: { type: String, required: true, default: "0" },

        defaultdata: { type: String, required: true, default: "branch" }

    },
    { timestamps: true }
);

const BranchModel =
    mongoose.models.branch1 || mongoose.model("branch1", BranchSchema);

export default BranchModel
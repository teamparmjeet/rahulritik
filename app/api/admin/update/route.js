import AdminModel from "@/model/Admin";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

export async function PATCH(req) {
    await dbConnect();

    try {
        const { name, email, mobile, password, branch, usertype, status } = await req.json();

        if (!email) {
            return new Response(
                JSON.stringify({
                    message: "Email is required!",
                    success: false,
                }),
                { status: 400 }
            );
        }

        const user = await AdminModel.findOne({ email });

        if (!user) {
            return new Response(
                JSON.stringify({
                    message: "User not found with the provided email!",
                    success: false,
                }),
                { status: 404 }
            );
        }

        const updates = { name, mobile, branch, usertype, status };

        // Only update password if it's provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.password = hashedPassword;
        }

        // Perform the update
        await AdminModel.updateOne({ email }, { $set: updates });

        return new Response(
            JSON.stringify({
                message: "User updated successfully",
                success: true,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({
                message: "Error updating user",
                success: false,
                error: error.message
            }),
            { status: 500 }
        );
    }
}

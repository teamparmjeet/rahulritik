import AdminModel from "@/model/Admin";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

export async function POST(req) {
    await dbConnect();

    try {
        const { name, email, mobile, password, branch, usertype } = await req.json();

       
        const alreadyUser = await AdminModel.findOne({ email });
        if (alreadyUser) {
            return Response.json(
                {
                    message: "User already exists with the provided email address!",
                    success: false,
                },
                { status: 400 }
            );
        }

        
        if (usertype === "1") {
            const branchExists = await AdminModel.findOne({ branch, usertype: "1" });
            if (branchExists) {
                return Response.json(
                    {
                        message: "An admin  already exists for this branch!",
                        success: false,
                    },
                    { status: 400 }
                );
            }
        }

       
        const hashedPassword = await bcrypt.hash(password, 10);

        const createAdmin = await AdminModel.create({
            name,
            mobile,
            email,
            password: hashedPassword,
            branch,
            usertype
        });

        return Response.json({
            message: "User registered successfully",
            success: true,
        }, { status: 201 });

    } catch (error) {
        console.log(error);
        return Response.json({
            message: "Error registering User",
            success: false
        }, { status: 500 });
    }
}

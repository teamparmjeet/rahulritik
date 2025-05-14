import dbConnect from "@/lib/dbConnect";
import ReferenceModel from "@/model/Reference";

export async function POST(req) {
    await dbConnect();

    try {
        const reference = await req.json();

        // Validate and handle suboptions if needed
        if (!reference.referencename) {
            return new Response(JSON.stringify({
                message: "Reference name is required",
                success: false
            }), { status: 400 });
        }

        // Create a new reference document with possible suboptions
        const newreference = new ReferenceModel({
            referencename: reference.referencename,
            defaultdata: reference.defaultdata || "reference",
            suboptions: reference.suboptions || [] // Default to empty array if not provided
        });

        await newreference.save();

        return new Response(JSON.stringify({
            message: "Reference Registered Successfully",
            success: true,
            data: { id: newreference._id }
        }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({
            message: "Error in Reference Registration",
            success: false,
            error: error.message
        }), { status: 500 });
    }
}

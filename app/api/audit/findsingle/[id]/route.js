import dbConnect from "@/lib/dbConnect";
import QueryUpdateModel from "@/model/AuditLog";

export const GET = async (request, { params }) => {
    try {
        await dbConnect();
        const { id } = params; // Destructure the ID from params
        const audit = await QueryUpdateModel.findOne({ queryId: id });

        if (!audit) {
            return new Response(
                JSON.stringify({
                    message: "Audit not found!",
                    success: false,
                }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify(audit),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error on getting audit:", error);
        return new Response(
            JSON.stringify({
                message: "Error on getting audit!",
                success: false,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};

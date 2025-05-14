import dbConnect from "@/lib/dbConnect";
import AdminModel from "@/model/Admin";
import QueryModel from "@/model/Query";

export async function PATCH() {
    await dbConnect();

    try {
        // Fetch all admins
        const admins = await AdminModel.find();

        if (!admins || admins.length === 0) {
            return new Response(JSON.stringify({ message: "No admins found." }), {
                status: 404,
            });
        }

        // Update lastbranch for queries associated with each admin
        let totalMatched = 0;
        let totalModified = 0;

        for (const admin of admins) {
            // Update lastbranch to admin's branch for queries where userid matches admin._id
            const updateResult = await QueryModel.updateMany(
                { 
                    assignedreceivedhistory: admin._id // Match queries where userid is the admin's _id
                },
                { 
                    $set: { branch: admin.branch } // Set lastbranch to admin's branch
                }
            );

            totalMatched += updateResult.matchedCount;
            totalModified += updateResult.modifiedCount;
        }

        return new Response(
            JSON.stringify({
                message: "Updated lastbranch for queries associated with all admins.",
                totalMatched,
                totalModified,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating queries:", error);
        return new Response(JSON.stringify({ message: "Internal server error." }), {
            status: 500,
        });
    }
}

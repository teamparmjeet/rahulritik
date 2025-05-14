import dbConnect from "@/lib/dbConnect";
import QueryUpdateModel from "@/model/AuditLog";
import QueryModel from "@/model/Query"; // Import the QueryModel to update deadline

export const PATCH = async (request) => {
    await dbConnect();

    try {
        const data = await request.json();

        // Basic validation for queryId
        if (!data.queryId) {
            return new Response(
                JSON.stringify({
                    message: "queryId is required",
                    success: false,
                }),
                { status: 400 }
            );
        }

        // Fetch the existing audit document
        const audit = await QueryUpdateModel.findOne({ queryId: data.queryId });

        if (!audit) {
            return new Response(
                JSON.stringify({
                    message: "Received invalid audit id!",
                    success: false,
                }),
                { status: 404 }
            );
        }

        // Find changes between the existing document and the incoming data
        const changes = {};
        for (const key in data) {
            if (JSON.stringify(audit[key]) !== JSON.stringify(data[key])) {
                changes[key] = {
                    oldValue: audit[key],
                    newValue: data[key],
                };
            }
        }

        // If no changes are found, return a message stating no updates were necessary
        if (Object.keys(changes).length === 0) {
            return new Response(
                JSON.stringify({
                    message: "No changes detected.",
                    success: false,
                }),
                { status: 400 }
            );
        }

        // Add the change history with detailed information
        const historyEntry = {
            action: "update",
            stage: audit.stage?.toString() || "unknown",
            actionBy: data.actionby || "system", // Default to "system" if no actionby is provided
            actionDate: new Date(),
            changes: changes,
        };

        // Update the fields with the new data and push the latest history entry
        await QueryUpdateModel.updateOne(
            { queryId: data.queryId },
            {
                $set: data, // Update the fields with the new data
                $push: { history: historyEntry }, // Push the latest history entry
            }
        );

        // Determine the last message based on the history entry
        const lastMessage = changes.message ? changes.message.newValue : "N/A";

        // Determine the deadline: use the provided one or set to tomorrow's date if not given
        const deadline = data.deadline ? new Date(data.deadline) : new Date();
        if (!data.deadline) {
            deadline.setDate(deadline.getDate() + 1); // Set to tomorrow if no deadline is provided
        }

        // Now update the deadline and last message in the related QueryModel document
        await QueryModel.updateOne(
            { _id: data.queryId }, // Find the related QueryModel document
            {
                $set: {
                    deadline: deadline.toISOString(),
                    lastDeadline: new Date().toISOString(),
                    lastgrade: data.grade || "N/A",
                    lastmessage: lastMessage,
                    lastactionby: data.actionby || "system",
                }
            }
        );

        return new Response(
            JSON.stringify({
                message: "Audit updated successfully!",
                success: true,
                auditid: data.queryId,
            }),
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating audit or deadline:", error);
        return new Response(
            JSON.stringify({
                message: "Error updating audit or deadline!",
                success: false,
            }),
            { status: 500 }
        );
    }
};

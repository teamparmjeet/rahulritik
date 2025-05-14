import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";

export const PATCH = async (request) => {
    await dbConnect();
    try {
        const data = await request.json();

        const querie = await QueryModel.findOne({ _id: data.id });

        if (!querie) {
            return new Response(
                JSON.stringify({
                    message: "Received invalid query id!",
                    success: false,
                }),
                { status: 404 }
            );
        }

        // Store the changes for history logging
        const updatedFields = {};
        Object.keys(data).forEach((key) => {
            if (key !== "id" && querie[key] !== data[key]) {
                updatedFields[key] = {
                    oldValue: querie[key],
                    newValue: data[key],
                };
            }
        });

        // Check if callStage is set to "auto-closed"
        if (data.callStage === "auto-closed") {
            data.autoclosed = "close"; // Automatically set autoclosed to "close"
        }

        // Update the document
        await QueryModel.updateOne(
            { _id: data.id },
            { $set: data }
        );

        // Save the changes in the history
        const historyEntry = {
            action: "Update",
            stage: "query-updated",  // Define the stage as "query-updated"
            actionBy: data.actionBy,  // Assuming actionBy is part of the request data (Admin ID)
            actionDate: new Date(),
            changes: updatedFields,  // Log all changes
        };

        await QueryModel.updateOne(
            { _id: data.id },
            { $push: { history: historyEntry } }
        );

        return new Response(
            JSON.stringify({
                message: "Query updated and changes saved to history!",
                success: true,
                queryId: data.id,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.log("Error on updating query:", error);
        return new Response(
            JSON.stringify({
                message: "Error on updating query!",
                success: false,
            }),
            { status: 500 }
        );
    }
};

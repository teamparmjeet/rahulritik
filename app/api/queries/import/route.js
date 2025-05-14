import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";
import QueryUpdateModel from "@/model/AuditLog"; // Import the audit log model

export async function POST(req, res) {
  await dbConnect();

  try {
    const queries = await req.json(); // Expect an array of queries

    if (!Array.isArray(queries)) {
      return new Response(JSON.stringify({
        success: false,
        message: "Data should be an array of queries",
      }), { status: 400 });
    }

    // Insert multiple queries using insertMany
    const result = await QueryModel.insertMany(queries);

    // Create audit log entries for each query
    const auditLogs = result.map(query => ({
      queryId: query._id, // Add the newly created query's ID to the audit log
    }));

    // Insert audit log entries using insertMany
    await QueryUpdateModel.insertMany(auditLogs);

    return new Response(JSON.stringify({
      message: `${result.length} Queries and Audit Logs Added Successfully`,
      success: true,
    }), { status: 200 });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message,
    }), { status: 500 });
  }
}

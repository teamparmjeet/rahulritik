import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";
import AdminModel from "@/model/Admin";
import AuditLog from "@/model/AuditLog";

// Helper function to escape special characters in a regex
const escapeRegex = (string) => {
  return string.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&"); // Escape regex special characters
};

export const GET = async (request) => {
  await dbConnect();

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const referenceId = searchParams.get("referenceId");
    const suboption = searchParams.get("suboption");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const admission = searchParams.get("admission");
    const grade = searchParams.get("grade");
    const location = searchParams.get("location");
    const city = searchParams.get("city");
    const assignedName = searchParams.get("assignedName");
    const assignedFrom = searchParams.get("assignedFrom");
    const userName = searchParams.get("userName");
    const showClosed = searchParams.get("showClosed");

    // Build MongoDB query
    const queryFilter = { defaultdata: "query" };

    if (referenceId) {
      const decodedReferenceId = decodeURIComponent(referenceId);
      const escapedReferenceId = escapeRegex(decodedReferenceId);
      queryFilter.referenceid = { $regex: escapedReferenceId, $options: "i" };
    }
    if (suboption) {
      queryFilter.suboption = { $regex: suboption, $options: "i" };
    }
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      if (!isNaN(from) && !isNaN(to)) {
        queryFilter.createdAt = { $gte: from, $lte: to };
      } else {
        throw new Error("Invalid date format for fromDate or toDate");
      }
    }
    if (admission) {
      queryFilter.addmission = admission === "true";
    }
    if (grade) {
      queryFilter.lastgrade = { $regex: grade, $options: "i" };
    }
    if (location) {
      queryFilter.branch = { $regex: location, $options: "i" };
    }
    if (city) {
      if (city.toLowerCase() === "jaipur") {
        queryFilter["studentContact.city"] = { $regex: "^Jaipur$", $options: "i" };
      } else {
        queryFilter["studentContact.city"] = { $ne: "Jaipur" };
      }
    }
    if (assignedName) {
      if (assignedName === "Not-Assigned") {
        // Filter for documents where `assignedTo` is exactly "Not-Assigned"
        queryFilter.assignedTo = "Not-Assigned";
      } else {
        const admin = await AdminModel.findOne({ name: { $regex: assignedName, $options: "i" } });
        if (admin) {
          queryFilter.assignedTo = admin._id;
        }
      }
    }
    if (assignedFrom) {
      if (assignedFrom === "Not-Assigned") {
        // Filter for documents where `assignedsenthistory` contains "Not-Assigned"
        queryFilter.assignedsenthistory = { $in: [""] };
      } else {
        const admin = await AdminModel.findOne({ name: { $regex: assignedFrom, $options: "i" } });
        if (admin) {
          // Filter for documents where `assignedsenthistory` contains the admin's ID
          queryFilter.assignedsenthistory = { $in: [admin._id.toString()] };
        }
      }
    }
    
    if (userName) {
      const admin = await AdminModel.findOne({ name: { $regex: userName, $options: "i" } });
      if (admin) {
        queryFilter.userid = admin._id;
      }
    }

    if (showClosed === "close") {
      queryFilter.autoclosed = "close";
  }
  

    // Fetch queries based on the filter
    const queries = await QueryModel.find(queryFilter);

    // Fetch admin data for mapping
    const admins = await AdminModel.find({}, { _id: 1, name: 1 });
    const adminMap = admins.reduce((map, admin) => {
      map[admin._id.toString()] = admin.name;
      return map;
    }, {});

    // Fetch audit logs for all queries
    const auditLogs = await AuditLog.find({ queryId: { $in: queries.map((query) => query._id) } });

    // Create a map of stages and history counts for each queryId
    const auditLogMap = auditLogs.reduce((map, log) => {
      const queryId = log.queryId.toString();
      if (!map[queryId]) {
        map[queryId] = { stage: log.stage, historyCount: 0 };
      }
      map[queryId].historyCount += log.history.length;
      return map;
    }, {});

    // Format the queries for response
    const formattedQueries = queries.map((query) => {
      const auditData = auditLogMap[query._id.toString()] || { stage: 0, historyCount: 0 };
      return {
        ...query._doc,
        userid: adminMap[query.userid] || query.userid,
        assignedTo: adminMap[query.assignedTo] || query.assignedTo,
        assignedsenthistory: query.assignedsenthistory.map((id) => adminMap[id] || id),
        assignedreceivedhistory: query.assignedreceivedhistory.map((id) => adminMap[id] || id),
        assignedToreq: adminMap[query.assignedToreq] || query.assignedToreq,
        historyCount: auditData.historyCount,
        stage: auditData.stage,
      };
    });

    // Return filtered and formatted queries
    return Response.json(
      {
        message: "All data fetched!",
        success: true,
        fetch: formattedQueries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error on getting data list:", error);
    return Response.json(
      {
        message: "Error on getting data list!",
        success: false,
      },
      { status: 500 }
    );
  }
};

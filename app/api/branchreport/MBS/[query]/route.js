import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";
import AdminModel from "@/model/Admin";
import AuditLog from "@/model/AuditLog";

export const GET = async () => {
    await dbConnect();

    try {
        // Fetch all queries and admins
        const queries = await QueryModel.find({});
        const admins = await AdminModel.find({}, { _id: 1, name: 1, branch: 1 });
        const adminMap = admins.reduce((map, admin) => {
            map[admin._id.toString()] = { name: admin.name, branch: admin.branch };
            map[admin.name] = { name: admin.name, branch: admin.branch }; // Map names too
            return map;
        }, {});

        // Map queries by their _id for quick lookup
        const queryMap = queries.reduce((map, query) => {
            map[query._id.toString()] = query;
            return map;
        }, {});

        // Fetch audit logs for queries
        const auditLogs = await AuditLog.find({ queryId: { $in: queries.map(q => q._id) } });

        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

        const analytics = auditLogs.reduce((acc, log) => {
            const queryId = log.queryId.toString(); // Get the query ID as a string
            log.history.forEach(entry => {
                const actionDate = new Date(entry.actionDate);
                const actionDay = actionDate.toISOString().split("T")[0];
                const actionMonth = actionDate.toISOString().slice(0, 7);
                const userId = entry.actionBy;
                const actionType = entry.action || "UNKNOWN";

                // Initialize data structures for the user
                acc.dailyActivity[userId] = acc.dailyActivity[userId] || {};
                acc.dailyActivity[userId][actionDay] = acc.dailyActivity[userId][actionDay] || { count: [0, 0], queries: [] };

                // Increment action count
                acc.dailyActivity[userId][actionDay].count[0]++;

                // Check for enrollment-related actions in the changes map and count admissions
                let admissionsCount = 0;
                if (
                    entry.changes.oflinesubStatus?.newValue === "admission" ||
                    entry.changes.onlinesubStatus?.newValue === "admission"
                ) {
                    admissionsCount = 1; // This entry is an admission
                    acc.dailyActivity[userId][actionDay].count[1]++; // Increment the daily admission count
                }

                // Add the query ID to the list of queries for the day
                if (!acc.dailyActivity[userId][actionDay].queries.includes(queryId)) {
                    acc.dailyActivity[userId][actionDay].queries.push(queryId);
                }

                // Increment the total activity and admissions counts for the month
                acc.monthlyActivity[userId] = acc.monthlyActivity[userId] || {};
                const currentMonthData = acc.monthlyActivity[userId][actionMonth] || [0, 0];
                currentMonthData[0]++; // Increment total activity
                currentMonthData[1] += admissionsCount; // Increment admissions count
                acc.monthlyActivity[userId][actionMonth] = currentMonthData;

                // Track weekly, trend, and other breakdowns
                acc.weeklyActivity[userId] = acc.weeklyActivity[userId] || 0;
                if (actionDate >= startOfWeek) acc.weeklyActivity[userId]++;

                acc.trendAnalysis[userId] = acc.trendAnalysis[userId] || { currentWeek: 0, lastWeek: 0 };
                if (actionDate >= startOfWeek) {
                    acc.trendAnalysis[userId].currentWeek++;
                } else if (actionDate >= startOfLastWeek) {
                    acc.trendAnalysis[userId].lastWeek++;
                }

                acc.actionBreakdown[userId] = acc.actionBreakdown[userId] || {};
                acc.actionBreakdown[userId][actionType] = (acc.actionBreakdown[userId][actionType] || 0) + 1;
            });

            return acc;
        }, {
            dailyActivity: {},
            weeklyActivity: {},
            monthlyActivity: {},
            actionBreakdown: {},
            trendAnalysis: {}
        });

        // Generate the final user activity report
        const userActivityReport = Object.entries(analytics.dailyActivity).map(([userId, days]) => {
            let adminData;

            if (userId === "system") {
                adminData = { name: "System", branch: "System" };
            } else {
                adminData = adminMap[userId] || { name: "Unknown", branch: "Unknown" };
            }

            return {
                userName: adminData.name,
                branch: adminData.branch,
                dailyActivity: Object.fromEntries(Object.entries(days).map(([day, data]) => {
                    return [day, { count: data.count, queries: data.queries }];
                })),
                weeklyActivity: analytics.weeklyActivity[userId] || 0,
                monthlyActivity: analytics.monthlyActivity[userId] || {},
                actionBreakdown: analytics.actionBreakdown[userId] || {},
                trendAnalysis: analytics.trendAnalysis[userId]
                    ? {
                        currentWeek: analytics.trendAnalysis[userId].currentWeek,
                        lastWeek: analytics.trendAnalysis[userId].lastWeek,
                        change: analytics.trendAnalysis[userId].currentWeek - analytics.trendAnalysis[userId].lastWeek,
                    }
                    : null,
            };
        });

        return Response.json({
            message: "Enhanced audit log analysis fetched successfully!",
            success: true,
            data: { userActivityReport },
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching data:", error);
        return Response.json({
            message: "Error fetching report!",
            success: false,
        }, { status: 500 });
    }
};

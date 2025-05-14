    import dbConnect from "@/lib/dbConnect";
    import QueryModel from "@/model/Query";
    import AdminModel from "@/model/Admin";
    import AuditLog from "@/model/AuditLog";

    export const GET = async (request, context) => {
        await dbConnect();
        const adminId = context.params.userid;
        try {
    
            if (!adminId) {
                return Response.json({
                    message: "Admin ID is required.",
                    success: false,
                }, { status: 400 });
            }
    
            // Fetch the specific admin
            const admin = await AdminModel.findById(adminId, { _id: 1, name: 1, branch: 1 });
            if (!admin) {
                return Response.json({
                    message: "Admin not found.",
                    success: false,
                }, { status: 404 });
            }
    
            // Fetch queries associated with the admin
            const queries = await QueryModel.find({ assignedTo: admin._id });
            const queryIds = queries.map(q => q._id.toString());
    
            // Fetch audit logs for queries associated with the admin
            const auditLogs = await AuditLog.find({ queryId: { $in: queryIds } });
    
            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            const startOfLastWeek = new Date(startOfWeek);
            startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    
            const analytics = auditLogs.reduce((acc, log) => {
                const queryId = log.queryId.toString();
                log.history.forEach(entry => {
                    const actionDate = new Date(entry.actionDate);
                    const actionDay = actionDate.toISOString().split("T")[0];
                    const actionMonth = actionDate.toISOString().slice(0, 7);
                    const userId = entry.actionBy;
                    const actionType = entry.action || "UNKNOWN";
    
                    acc.dailyActivity[actionDay] = acc.dailyActivity[actionDay] || { count: [0, 0], queries: [] };
                    acc.dailyActivity[actionDay].count[0]++;
                    let admissionsCount = 0;
    
                    if (
                        entry.changes.oflinesubStatus?.newValue === "admission" ||
                        entry.changes.onlinesubStatus?.newValue === "admission"
                    ) {
                        admissionsCount = 1;
                        acc.dailyActivity[actionDay].count[1]++;
                    }
    
                    // Fetch the full query data and add it to the daily activity
                    const queryData = queries.find(q => q._id.toString() === queryId);
                    if (queryData && !acc.dailyActivity[actionDay].queries.some(q => q._id.toString() === queryId)) {
                        acc.dailyActivity[actionDay].queries.push(queryData);
                    }
    
                    acc.monthlyActivity[actionMonth] = acc.monthlyActivity[actionMonth] || [0, 0];
                    acc.monthlyActivity[actionMonth][0]++;
                    acc.monthlyActivity[actionMonth][1] += admissionsCount;
    
                    acc.weeklyActivity = acc.weeklyActivity || 0;
                    if (actionDate >= startOfWeek) acc.weeklyActivity++;
    
                    acc.trendAnalysis = acc.trendAnalysis || { currentWeek: 0, lastWeek: 0 };
                    if (actionDate >= startOfWeek) {
                        acc.trendAnalysis.currentWeek++;
                    } else if (actionDate >= startOfLastWeek) {
                        acc.trendAnalysis.lastWeek++;
                    }
    
                    acc.actionBreakdown[actionType] = (acc.actionBreakdown[actionType] || 0) + 1;
                });
    
                return acc;
            }, {
                dailyActivity: {},
                weeklyActivity: 0,
                monthlyActivity: {},
                actionBreakdown: {},
                trendAnalysis: { currentWeek: 0, lastWeek: 0 },
            });
    
            const userActivityReport = {
                userName: admin.name,
                branch: admin.branch,
                dailyActivity: analytics.dailyActivity,
                weeklyActivity: analytics.weeklyActivity,
                monthlyActivity: analytics.monthlyActivity,
                actionBreakdown: analytics.actionBreakdown,
                trendAnalysis: {
                    currentWeek: analytics.trendAnalysis.currentWeek,
                    lastWeek: analytics.trendAnalysis.lastWeek,
                    change: analytics.trendAnalysis.currentWeek - analytics.trendAnalysis.lastWeek,
                },
            };
    
            return Response.json({
                message: "Admin-specific audit log analysis fetched successfully!",
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
    
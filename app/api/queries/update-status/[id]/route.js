import dbConnect from "@/lib/dbConnect";
import QueryModel from "@/model/Query";

export const GET = async (request, context) => {
    await dbConnect();

    try {
        const id = context.params.id;
        const { stage, action } = request.json();

        const query = await QueryModel.findById(id);

        if (!query) {
            return Response.json(
                {
                    message: "Query not found!",
                    success: false,
                },
                { status: 404 }
            );
        }

        if (stage === 'callStage') {
            handleCallStage(query, action);
        } else if (stage === 'connectionStatus') {
            handleConnectionStatus(query, action);
        } else if (stage === 'leadStatus') {
            handleLeadStatus(query, action);
        } else {
            return Response({ success: false, message: 'Invalid stage' }, { status: 400 });
        }

        // Save updated query
        query.history.push({
            action: `Stage: ${stage} updated to ${action}`,
            actionBy: request.Admin._id,
        });
        await query.save();

        return Response.json(
            { success: true, query },
            { status: 200 }
        )



    } catch (error) {
        return Response.json(
            {
                message: "Something Goes Wrong With Process",
                success: false,
            }, { status: 404 }
        )
    }




}

const handleCallStage = (query, action) => {
    const allowedCallStages = ['new', 'RNR1', 'RNR2', 'RNR3', 'busy', 'call-back', 'auto-closed'];

    if (allowedCallStages.includes(action)) {
        if (query.callStage === 'new' && action === 'RNR1') {
            query.callStage = 'RNR1';
        } else if (query.callStage === 'RNR1' && action === 'RNR2') {
            query.callStage = 'RNR2';
        } else if (query.callStage === 'RNR2' && action === 'RNR3') {
            query.callStage = 'RNR3';
        } else if (query.callStage === 'RNR3' && action === 'auto-closed') {
            query.callStage = 'auto-closed'; // After RNR3, auto-closure
            query.status = 'spam';
        } else if (action === 'call-back') {
            query.callStage = 'call-back';
        } else if (action === 'busy') {
            query.callStage = 'busy';
        } else {
            throw new Error('Invalid call stage transition');
        }
    } else {
        throw new Error('Invalid call stage action');
    }
};

const handleConnectionStatus = (query, action) => {
    const allowedConnectionStages = ['not-connected1', 'not-connected2', 'not-connected3', 'connected', 'transferred'];

    if (allowedConnectionStages.includes(action)) {
        if (query.connectionStatus === 'not-connected1' && action === 'not-connected2') {
            query.connectionStatus = 'not-connected2';
        } else if (query.connectionStatus === 'not-connected2' && action === 'not-connected3') {
            query.connectionStatus = 'not-connected3';
        } else if (query.connectionStatus === 'not-connected3' && action === 'transferred') {
            query.connectionStatus = 'transferred'; // After 3 attempts, auto-transfer
            // Here, you should implement the logic to transfer the query to another branch
        } else if (action === 'connected') {
            query.connectionStatus = 'connected';
        } else {
            throw new Error('Invalid connection status transition');
        }
    } else {
        throw new Error('Invalid connection status action');
    }
};

const handleLeadStatus = (query, action) => {
    const allowedLeadStatuses = ['wrong-lead', 'not-interested', 'interested', 'NPR1', 'NPR2', 'ready-to-join', 'enrolled', 'branch-visited', 'not-visited'];

    if (allowedLeadStatuses.includes(action)) {
        if (action === 'wrong-lead') {
            query.leadStatus = 'wrong-lead';
        } else if (action === 'not-interested') {
            query.leadStatus = 'not-interested';
        } else if (action === 'NPR1' || action === 'NPR2') {
            query.leadStatus = action;
        } else if (action === 'ready-to-join') {
            query.leadStatus = 'ready-to-join';
        } else if (action === 'enrolled') {
            query.leadStatus = 'enrolled';
        } else if (action === 'branch-visited') {
            query.leadStatus = 'branch-visited';
        } else if (action === 'not-visited') {
            query.leadStatus = 'not-visited';
        } else {
            throw new Error('Invalid lead status transition');
        }
    } else {
        throw new Error('Invalid lead status action');
    }
};
import mongoose, { Schema } from "mongoose";

const QueryUpdateSchema = new Schema({
  queryId: {
    type: String,
    required: true
  },

  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'Null'],
    default: 'Null',
    required: true
  },

  actionby: {
    type: String,
    default: "null",
    required: true
  },
  connectionStatus: {
    type: String,
    enum: ['connected', 'no_connected', 'not_lifting', 'wrong_no', 'initial'], // main options
    default: 'initial',
    required: true,
  },


  // if Connected
  connectedsubStatus: {
    type: String,
    enum: ['interested', 'not_interested', 'response', 'initial'], default: 'initial', required: true,
  },
  interestedsubStatus: {
    type: String,
    enum: ['online', 'ofline', 'response', 'initial'], default: 'initial', required: true,
  },
  onlinesubStatus: {
    type: String,
    enum: ['interested_but_not_proper_response', 'admission', 'response', 'initial'], default: 'initial', required: true,
  },
  oflinesubStatus: {
    type: String,
    enum: ['interested_but_not_proper_response', 'admission', 'ready_visit', 'response', 'initial'], default: 'initial', required: true,
  },
  ready_visit: {
    type: String,
    enum: ['visited', 'no_visit_branch_yet', 'not_interested', 'not_confirmed_yet', 'response', 'initial'], default: 'initial', required: true,
  },
  visited_subStatus: {
    type: String,
    enum: ['admission', 'not_interested', 'response', 'initial'], default: 'initial', required: true,
  },



  // if Not Connected
  no_connectedsubStatus: {
    type: String,
    enum: ['switch_off', 'network_error', 'callconnected', 'initial'], default: 'initial', required: true,
  },


  // if Not Lifting Call
  not_liftingsubStatus: {
    type: String,
    enum: ['busy', 'call_back', 'callconnected', 'initial'], default: 'initial', required: true,
  },


  message: {
    type: String,
    default: "null",
    required: true
  },

  stage: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    default: 0,
    required: true,
  },

  statusCounts: {
    busy: { type: Number, default: 0, required: true, },
    call_back: { type: Number, default: 0, required: true, },
    switch_off: { type: Number, default: 0, required: true, },
    network_error: { type: Number, default: 0, required: true, },
    interested_but_not_proper_response: { type: Number, default: 0, required: true, },
    no_visit_branch_yet: { type: Number, default: 0, required: true, },
    not_confirmed_yet: { type: Number, default: 0, required: true, },
    not_proper_response: { type: Number, default: 0, required: true, }
  },

  history: [
    {
      action: String,
      stage: String,
      actionBy: String,
      actionDate: { type: Date, default: Date.now },
      changes: {
        type: Map,
        of: {
          oldValue: Schema.Types.Mixed,
          newValue: Schema.Types.Mixed,
        },
      },
    },
  ],

  wrongNo: {
    type: Boolean,
    default: false
  },

  autoClose: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });


const QueryUpdateModel = mongoose.models.Queryupdate10 || mongoose.model('Queryupdate10', QueryUpdateSchema);

export default QueryUpdateModel;

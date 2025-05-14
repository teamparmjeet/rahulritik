import mongoose, { Schema } from "mongoose";

const ReferenceSchema = new Schema(
    {
        referencename: {
            type: String,
            required: true
        },
        defaultdata: { 
            type: String, 
            required: true, 
            default: "reference" 
        },
        suboptions: [
            {
                name: {
                    type: String,
                    
                }
            }
        ]
    },
    { timestamps: true }
);

const ReferenceModel =
    mongoose.models.refernce3 || mongoose.model("refernce3", ReferenceSchema);

export default ReferenceModel;

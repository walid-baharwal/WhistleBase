import mongoose, { Schema, Document } from "mongoose";

export interface Case extends Document {
    form_id: mongoose.Types.ObjectId;
    case_code: string;
    category: string;
    content: string;
    is_anonymous: boolean;
    status: "OPEN" | "CLOSED";
}

const caseSchema: Schema<Case> = new Schema(
    {
        form_id: {
            type: Schema.Types.ObjectId,
            ref: "Form",
            required: true,
        },
        case_code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        is_anonymous: {
            type: Boolean,
            required: true,
            default: false,
        },
        status: {
            type: String,
            required: true,
            enum: ["OPEN", "CLOSED"],
            default: "OPEN",
        },
    },
    { timestamps: true }
);

const CaseModel =
    (mongoose.models.Case as mongoose.Model<Case>) || 
    mongoose.model<Case>("Case", caseSchema);

export default CaseModel; 
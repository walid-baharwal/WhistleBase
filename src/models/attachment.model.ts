import mongoose, { Schema, Document } from "mongoose";

export interface Attachment extends Document {
    case_id: mongoose.Types.ObjectId;
    organization_id: mongoose.Types.ObjectId;
    file_name: string;
    storage_key: string;
    mime_type: string;
    size: number;
    access_scope: "public" | "org_only";
    message_id?: mongoose.Types.ObjectId;
    uploaded_by: mongoose.Types.ObjectId;
    uploaded_at: Date;
}

const attachmentSchema: Schema<Attachment> = new Schema(
    {
        case_id: {
            type: Schema.Types.ObjectId,
            ref: "Case",
            required: true,
        },
        organization_id: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        file_name: {
            type: String,
            required: true,
            trim: true,
        },
        storage_key: {
            type: String,
            required: true,
            trim: true,
        },
        mime_type: {
            type: String,
            required: true,
            trim: true,
        },
        size: {
            type: Number,
            required: true,
            min: 0,
        },
        access_scope: {
            type: String,
            required: true,
            enum: ["public", "org_only"],
            default: "org_only",
        },
        message_id: {
            type: Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        uploaded_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        uploaded_at: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const AttachmentModel =
    (mongoose.models.Attachment as mongoose.Model<Attachment>) || 
    mongoose.model<Attachment>("Attachment", attachmentSchema);

export default AttachmentModel; 
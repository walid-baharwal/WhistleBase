import mongoose, { Schema, Document } from "mongoose";

export interface Attachment extends Document {
    case_id: mongoose.Types.ObjectId;
    organization_id: mongoose.Types.ObjectId;
    file_name: string;
    storage_key: string;
    mime_type: string;
    size: number;
    message_id?: mongoose.Types.ObjectId | null;
    uploaded_by: mongoose.Types.ObjectId | null;
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
        message_id: {
            type: Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        uploaded_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
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
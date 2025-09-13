import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
    case_id: mongoose.Types.ObjectId;
    sender_type: "ANONYMOUS" | "ADMIN";
    sender_id?: mongoose.Types.ObjectId | null;
    message: string;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema: Schema<Message> = new Schema(
    {
        case_id: {
            type: Schema.Types.ObjectId,
            ref: "Case",
            required: true,
        },
        sender_type: {
            type: String,
            required: true,
            enum: ["ANONYMOUS", "ADMIN"],
        },
        sender_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        message: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

const MessageModel =
    (mongoose.models.Message as mongoose.Model<Message>) || 
    mongoose.model<Message>("Message", messageSchema);

export default MessageModel; 
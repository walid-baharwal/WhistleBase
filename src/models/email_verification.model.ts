import mongoose, { Schema, Document } from "mongoose";

export interface EmailVerification extends Document {
    user_id: mongoose.Types.ObjectId;
    token: string;
    expires_at: Date;
}

const emailVerificationSchema: Schema<EmailVerification> = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        expires_at: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

const EmailVerificationModel =
    (mongoose.models.EmailVerification as mongoose.Model<EmailVerification>) || 
    mongoose.model<EmailVerification>("EmailVerification", emailVerificationSchema);

export default EmailVerificationModel; 
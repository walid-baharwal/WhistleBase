import mongoose, { Schema, Document } from "mongoose";

export interface EmailVerification extends Document {
    user_id: mongoose.Types.ObjectId;
    token: string;
    expires_at: Date;
    type: "email_verification" | "password_reset";
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
        type: {
            type: String,
            enum: ["email_verification", "password_reset"],
            default: "email_verification",
            required: false,
        },
    },
    { timestamps: true }
);

emailVerificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const EmailVerificationModel =
    (mongoose.models.EmailVerification as mongoose.Model<EmailVerification>) || 
    mongoose.model<EmailVerification>("EmailVerification", emailVerificationSchema);

export default EmailVerificationModel; 
import mongoose, { Schema, Document } from "mongoose";

export interface OrganizationInvite extends Document {
    email: string;
    organization_id: mongoose.Types.ObjectId;
    role: string;
    token: string;
    expires_at: Date;
    accepted_at?: Date;
}

const organizationInviteSchema: Schema<OrganizationInvite> = new Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        organization_id: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["admin", "member", "viewer"],
            default: "member",
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
        accepted_at: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const OrganizationInviteModel =
    (mongoose.models.OrganizationInvite as mongoose.Model<OrganizationInvite>) || 
    mongoose.model<OrganizationInvite>("OrganizationInvite", organizationInviteSchema);

export default OrganizationInviteModel; 
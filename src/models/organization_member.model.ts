import mongoose, { Schema, Document } from "mongoose";

export interface OrganizationMember extends Document {
    user_id: mongoose.Types.ObjectId;
    organization_id: mongoose.Types.ObjectId;
    role: string;
}

const organizationMemberSchema: Schema<OrganizationMember> = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
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
    },
    { timestamps: true }
);

// Compound index to ensure unique user-organization combinations
organizationMemberSchema.index({ user_id: 1, organization_id: 1 }, { unique: true });

const OrganizationMemberModel =
    (mongoose.models.OrganizationMember as mongoose.Model<OrganizationMember>) || 
    mongoose.model<OrganizationMember>("OrganizationMember", organizationMemberSchema);

export default OrganizationMemberModel; 
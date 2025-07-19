import mongoose, { Schema, Document } from "mongoose";

export interface OrganizationMember extends Document {
    user_id: mongoose.Types.ObjectId;
    organization_id: mongoose.Types.ObjectId;
    role: string;
    private_key: string;
    salt: string;
    nonce: string;
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
            enum: ["ADMIN", "EDITOR", "VIEWER"],
            default: "VIEWER",
        },
        private_key: {
            type: String,
            required: true,
            trim: true,
        },
        salt: {
            type: String,
            required: true,
            trim: true,
        },
        nonce: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);


organizationMemberSchema.index({ user_id: 1, organization_id: 1 }, { unique: true });

const OrganizationMemberModel =
    (mongoose.models.OrganizationMember as mongoose.Model<OrganizationMember>) || 
    mongoose.model<OrganizationMember>("OrganizationMember", organizationMemberSchema);

export default OrganizationMemberModel; 
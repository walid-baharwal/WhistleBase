import mongoose, { Schema, Document } from "mongoose";

export interface Organization extends Document {
    name: string;
    owner: mongoose.Types.ObjectId;
    country: string;
}

const organizationSchema: Schema<Organization> = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
        }
    },
    { timestamps: true }
);

const OrganizationModel =
    (mongoose.models.Organization as mongoose.Model<Organization>) || 
    mongoose.model<Organization>("Organization", organizationSchema);

export default OrganizationModel; 
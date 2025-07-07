import mongoose, { Schema, Document } from "mongoose";

export interface Form extends Document {
    logo?: string;
    primary_color: string;
    organization_id: mongoose.Types.ObjectId;
    slug: string;
    access_code: string;
    title: string;
    description: string;
    submission_message: string;
}

const formSchema: Schema<Form> = new Schema(
    {
        logo: {
            type: String,
            default: null,
        },
        primary_color: {
            type: String,
            required: true,
            default: "#000000",
        },
        organization_id: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        access_code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        submission_message: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

const FormModel =
    (mongoose.models.Form as mongoose.Model<Form>) || 
    mongoose.model<Form>("Form", formSchema);

export default FormModel; 
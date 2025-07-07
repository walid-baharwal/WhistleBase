import mongoose, { Schema, Document } from "mongoose";

export interface Plan extends Document {
    name: string;
    stripe_price_id: string;
    price: number;
    benefits: string[];
    interval: string;
    max_cases: number;
    max_admins: number;
    has_file_upload: boolean;
    has_custom_branding: boolean;
}

const planSchema: Schema<Plan> = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        stripe_price_id: {
            type: String,
            required: true,
            unique: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        benefits: {
            type: [String],
            default: [],
        },
        interval: {
            type: String,
            required: true,
            enum: ["month", "year"],
        },
        max_cases: {
            type: Number,
            required: true,
            min: 0,
        },
        max_admins: {
            type: Number,
            required: true,
            min: 1,
        },
        has_file_upload: {
            type: Boolean,
            default: false,
        },
        has_custom_branding: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const PlanModel =
    (mongoose.models.Plan as mongoose.Model<Plan>) || 
    mongoose.model<Plan>("Plan", planSchema);

export default PlanModel; 
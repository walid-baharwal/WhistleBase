import mongoose, { Schema, Document } from "mongoose";

export interface OrganizationBilling extends Document {
    organization_id: mongoose.Types.ObjectId;
    stripe_customer_id: string;
    stripe_payment_ids: string[];
    billing_name: string;
    billing_email: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
}

const organizationBillingSchema: Schema<OrganizationBilling> = new Schema(
    {
        organization_id: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            unique: true,
        },
        stripe_customer_id: {
            type: String,
            required: true,
            unique: true,
        },
        stripe_payment_ids: {
            type: [String],
            default: [],
        },
        billing_name: {
            type: String,
            required: true,
            trim: true,
        },
        billing_email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        postal_code: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

const OrganizationBillingModel =
    (mongoose.models.OrganizationBilling as mongoose.Model<OrganizationBilling>) || 
    mongoose.model<OrganizationBilling>("OrganizationBilling", organizationBillingSchema);

export default OrganizationBillingModel; 
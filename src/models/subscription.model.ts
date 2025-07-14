import mongoose, { Schema, Document } from "mongoose";

export interface Subscription extends Document {
    organization_id: mongoose.Types.ObjectId;
    plan_id: mongoose.Types.ObjectId;
    stripe_subscription_id: string;
    type: "TRIAL" | "PAID";
    started_at: Date;
    ends_at: Date;
}

const subscriptionSchema: Schema<Subscription> = new Schema(
    {
        organization_id: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        plan_id: {
            type: Schema.Types.ObjectId,
            ref: "Plan",
        },
        stripe_subscription_id: {
            type: String,
            unique: true,
            sparse: true,
        },
        type: {
            type: String,
            enum: ["TRIAL", "PAID"],
        },
        started_at: {
            type: Date,
            required: true,
        },
        ends_at: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

const SubscriptionModel =
    (mongoose.models.Subscription as mongoose.Model<Subscription>) || 
    mongoose.model<Subscription>("Subscription", subscriptionSchema);

export default SubscriptionModel; 
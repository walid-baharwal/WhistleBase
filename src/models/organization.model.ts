import mongoose, { Schema, Document } from "mongoose";
import { getSodium } from "@/lib/sodium-server";

export interface Organization extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  country: string;
  public_key: string;
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
    },
    public_key: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

organizationSchema.pre("save", async function (next) {
  const sodium = await getSodium();
  if (this.isModified("public_key") && typeof this.public_key !== "string") {
    this.public_key = sodium.to_base64(this.public_key);
  }
  next();
});
organizationSchema.methods.getPublicKeyUint8 = async function () {
  const sodium = await getSodium();
  return sodium.from_base64(this.public_key);
};

const OrganizationModel =
  (mongoose.models.Organization as mongoose.Model<Organization>) ||
  mongoose.model<Organization>("Organization", organizationSchema);

export default OrganizationModel;

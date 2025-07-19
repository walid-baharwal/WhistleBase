import mongoose, { Schema, Document } from "mongoose";

export interface OrganizationUnit extends Document {
  organization_id: mongoose.Types.ObjectId;
  name: string;
  parent_unit_id?: mongoose.Types.ObjectId;
}

const organizationUnitSchema: Schema<OrganizationUnit> = new Schema(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parent_unit_id: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationUnit",
      default: null,
    },
  },
  { timestamps: true }
);

organizationUnitSchema.index({ organization_id: 1, name: 1 }, { unique: true });

const OrganizationUnitModel =
  (mongoose.models.OrganizationUnit as mongoose.Model<OrganizationUnit>) ||
  mongoose.model<OrganizationUnit>("OrganizationUnit", organizationUnitSchema);

export default OrganizationUnitModel;

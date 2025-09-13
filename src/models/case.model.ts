import mongoose, { Schema, Document } from "mongoose";

export interface Attachment extends Document {
  _id: mongoose.Types.ObjectId;
  organization_id: mongoose.Types.ObjectId;
  file_name: string;
  mime_type: string;
  size: number;
  storage_key: string;
}

export interface Case extends Document {
  channel_id: mongoose.Types.ObjectId;
  anon_public_key: string;
  organization_id: mongoose.Types.ObjectId;
  category: string;
  content: string;
  status: "OPEN" | "CLOSED";
  justification: "JUSTIFIED" | "UNJUSTIFIED" | "NONE";
  forAdmin: string;
  forAnonUser: string;
  access_code?: string;
}

const caseSchema: Schema<Case> = new Schema(
  {
    channel_id: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    anon_public_key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },
    justification: {
      type: String,
      required: true,
      enum: ["JUSTIFIED", "UNJUSTIFIED", "NONE"],
      default: "NONE",
    },

    forAdmin: {
      type: String,
      required: true,
      trim: true,
    },
    forAnonUser: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const CaseModel =
  (mongoose.models.Case as mongoose.Model<Case>) || mongoose.model<Case>("Case", caseSchema);

export default CaseModel;

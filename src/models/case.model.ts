import mongoose, { Schema, Document } from "mongoose";

export interface Case extends Document {
  channel_id: mongoose.Types.ObjectId;
  anon_public_key: string;
  category: string;
  content: string;
  status: "OPEN" | "CLOSED";
  justification: "JUSTIFIED" | "UNJUSTIFIED" | "NONE";
  forReceiver: string;
  forSender: string;
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

    forReceiver: {
      type: String,
      required: true,
      trim: true,
    },
    forSender: {
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

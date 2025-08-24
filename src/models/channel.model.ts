import mongoose, { Schema, Document } from "mongoose";

export interface Channel extends Document {
  organization_id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  slug: string;
  access_code: string;
  primary_color: string;
  submission_message: string;
  is_active: boolean;
}

const channelSchema: Schema<Channel> = new Schema(
  {
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
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
    is_active: {
      type: Boolean,
      required: true,
      default: true,
    },
    primary_color: {
      type: String,
      required: true,
      default: "#000000",
    },
    submission_message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const ChannelModel =
  (mongoose.models.Channel as mongoose.Model<Channel>) ||
  mongoose.model<Channel>("Channel", channelSchema);

export default ChannelModel;

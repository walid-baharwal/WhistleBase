"use server";

import dbConnect from "@/lib/dbConnect";
import ChannelModel from "@/models/channel.model";
import { accessCodeSchema } from "@/schemas/accessCode.schema";
import { redirect } from "next/navigation";

export async function verifyAccessCode(formData: FormData) {
  try {
    await dbConnect();

    const accessCode = formData.get("accessCode") as string;

    const validatedData = accessCodeSchema.parse({ accessCode });

    const channel = await ChannelModel.findOne({
      access_code: validatedData.accessCode,
      is_active: true,
    }).select("_id title organization_id");

    if (!channel) {
      throw new Error("Invalid access code. Please check and try again.");
    }

    redirect(`/c/${validatedData.accessCode}`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to verify access code";
    redirect(`/access-code?error=${encodeURIComponent(errorMessage)}`);
  }
}

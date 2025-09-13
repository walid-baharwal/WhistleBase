"use server";
import dbConnect from "@/lib/dbConnect";
import Channel from "@/models/channel.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function getChannels() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?.organization_id) {
      throw new Error("User session or organization not found");
    }

    const channels = await Channel.find({
      organization_id: session.user.organization_id,
    })
      .select("_id title description primary_color is_active")
      .lean();

    return channels.map((channel) => ({
      ...channel,
      _id: channel._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching channels:", error);
    throw new Error("Failed to fetch channels");
  }
}

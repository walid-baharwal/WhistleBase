import React from "react";
import dbConnect from "@/lib/dbConnect";
import ChannelModel from "@/models/channel.model";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import SecurityMessage from "@/components/security-message";

interface PageProps {
  params: Promise<{
    "access-code": string;
  }>;
}

async function getChannelByAccessCode(accessCode: string) {
  await dbConnect();

  const channel = await ChannelModel.findOne({
    access_code: accessCode,
    is_active: true,
  })
    .select("_id title description primary_color submission_message organization_id")
    .lean();

  if (!channel) {
    return null;
  }

  return {
    ...channel,
    _id: channel._id.toString(),
    organization_id: channel.organization_id.toString(),
    submission_message: channel.submission_message || null,
  };
}

export default async function ChannelPage({ params }: PageProps) {
  const resolvedParams = await params;
  const accessCode = resolvedParams["access-code"];
  const channel = await getChannelByAccessCode(accessCode);

  if (!channel) {
    notFound();
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4 "
      style={
        {
          "--primary-color": channel.primary_color,
        } as React.CSSProperties & { "--primary-color": string }
      }
    >
      <div className="w-auto mx-auto     ">
        <div className="text-left mb-12">
          <h1 className="text-4xl font-bold mb-6" style={{ color: channel.primary_color }}>
            {channel.title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">{channel.description}</p>
        </div>

        <div className="flex flex-row gap-4 max-w-2xl">
          <Button
            asChild
            size="lg"
            className="flex-1 px-8 py-4 text-lg font-semibold"
            style={{
              backgroundColor: channel.primary_color,
              borderColor: channel.primary_color,
            }}
          >
            <Link href={`/c/${accessCode}/create`} className="flex items-center gap-3">
              <Plus className="h-6 w-6" />
              Create a case
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="flex-1 px-8 py-4 text-lg font-semibold"
            style={{
              borderColor: channel.primary_color,
              color: channel.primary_color,
            }}
          >
            <Link href={`/c/${accessCode}/check`} className="flex items-center gap-3">
              <Search className="h-6 w-6" />
              Check a case
            </Link>
          </Button>
        </div>

        <SecurityMessage />
      </div>
    </div>
  );
}

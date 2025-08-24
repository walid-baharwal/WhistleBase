import React from "react";
import dbConnect from "@/lib/dbConnect";
import ChannelModel from "@/models/channel.model";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search } from "lucide-react";
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
    .select("_id title description primary_color organization_id")
    .lean();

  if (!channel) {
    return null;
  }

  return {
    ...channel,
    _id: channel._id.toString(),
    organization_id: channel.organization_id.toString(),
  };
}

export default async function CheckCasePage({ params }: PageProps) {
  const resolvedParams = await params;
  const accessCode = resolvedParams["access-code"];
  const channel = await getChannelByAccessCode(accessCode);

  if (!channel) {
    notFound();
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4 focus-primary"
      style={
        {
          "--primary-color": channel.primary_color,
        } as React.CSSProperties & { "--primary-color": string }
      }
    >
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/c/${accessCode}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to channel
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-4" style={{ color: channel.primary_color }}>
            Check Case Status
          </h1>
          <p className="text-gray-600">
            Enter your case ID to check the status of your submitted report
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="case_id">Case ID</Label>
            <Input
              id="case_id"
              name="case_id"
              placeholder="Enter your case ID"
              required
              className="w-full text-center font-mono"
            />
            <p className="text-sm text-gray-500 text-center">
              This was provided when you submitted your report
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            style={{ backgroundColor: channel.primary_color }}
          >
            <Search className="h-4 w-4 mr-2" />
            Check Case Status
          </Button>
        </form>

        <SecurityMessage />
      </div>
    </div>
  );
}

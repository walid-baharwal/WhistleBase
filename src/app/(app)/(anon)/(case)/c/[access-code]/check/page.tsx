import React from "react";
import dbConnect from "@/lib/dbConnect";
import ChannelModel from "@/models/channel.model";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SecurityMessage from "@/components/security-message";
import CheckCaseForm from "@/screens/case/CheckCaseForm";

interface PageProps {
  params: Promise<{
    "access-code": string;
  }>;
  searchParams: Promise<{
    error?: string;
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

export default async function CheckCasePage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const accessCode = resolvedParams["access-code"];
  const error = resolvedSearchParams.error;
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
            Enter your case reference key to check the status of your submitted report
          </p>
        </div>

        <CheckCaseForm 
          accessCode={accessCode} 
          primaryColor={channel.primary_color}
          error={error}
        />

        <SecurityMessage />
      </div>
    </div>
  );
}
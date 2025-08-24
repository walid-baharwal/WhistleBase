import React from "react";
import dbConnect from "@/lib/dbConnect";
import ChannelModel from "@/models/channel.model";
import { notFound } from "next/navigation";
import { CreateCaseForm } from "@/screens/case";

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
  }).select("_id title description primary_color submission_message organization_id").lean();
  
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

export default async function CreateCasePage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const accessCode = resolvedParams["access-code"];
  const channel = await getChannelByAccessCode(accessCode);
  
  if (!channel) {
    notFound();
  }
  
  return (
    <div 
      className="focus-primary"
      style={{
        '--primary-color': channel.primary_color
      } as React.CSSProperties & { '--primary-color': string }}
    >
      <CreateCaseForm 
        channel={channel} 
        accessCode={accessCode} 
        error={resolvedSearchParams.error} 
      />
    </div>
  );
}

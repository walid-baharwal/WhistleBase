import React from "react";
import { CheckCircle, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dbConnect from "@/lib/dbConnect";
import ChannelModel from "@/models/channel.model";
import CaseKeyDisplay from "@/components/CaseKeyDisplay";

interface PageProps {
  params: Promise<{
    "access-code": string;
  }>;
  searchParams: Promise<{
    case_id?: string;
    access_key?: string;
  }>;
}

async function getChannelByAccessCode(accessCode: string) {
  await dbConnect();

  const channel = await ChannelModel.findOne({
    access_code: accessCode,
    is_active: true,
  })
    .select("primary_color title")
    .lean();

  return {
    primaryColor: channel?.primary_color || "#3b82f6",
    title: channel?.title || "Unknown Channel",
  };
}

export default async function CaseSuccessPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const accessCode = resolvedParams["access-code"];
  const caseId = resolvedSearchParams.case_id;
  const accessKey = resolvedSearchParams.access_key;
  const { primaryColor, title: channelTitle } = await getChannelByAccessCode(accessCode);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-semibold mb-4 text-green-800">
            Report Submitted Successfully
          </h1>
          <p className="text-gray-600 text-lg">
            Thank you for speaking up. Your report has been securely submitted.
          </p>
        </div>

        {accessKey && caseId && (
          <CaseKeyDisplay
            accessKey={accessKey}
            caseId={caseId}
            channelTitle={channelTitle}
            accessCode={accessCode}
            primaryColor={primaryColor}
          />
        )}

        {caseId && !accessKey && (
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Reference Information</h2>
            <p className="text-blue-700 text-sm">
              Case ID: <code className="font-mono bg-blue-100 px-2 py-1 rounded">{caseId}</code>
            </p>
            <p className="text-blue-600 text-xs mt-2">
              Please save this information for your records
            </p>
          </div>
        )}

        <div className="bg-green-50 p-6 rounded-lg mb-8">
          <div className="flex items-center  mb-3">
            <Shield className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-green-800">Your Privacy is Protected</h3>
          </div>
          <ul className="text-green-700 text-sm space-y-2 text-left w-auto mx-auto">
            <li>• Your identity is completely anonymous</li>
            <li>• All communication is end-to-end encrypted</li>
            <li>• No personal information is stored or tracked</li>
            <li>• Your report will be investigated promptly</li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            The organization will review your report and may follow up if additional information is
            needed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild style={{ backgroundColor: primaryColor }}>
              <Link href={`/c/${accessCode}/create`}>Submit Another Report</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              style={{ borderColor: primaryColor, color: primaryColor }}
              className={`hover:shadow-md hover:bg-transparent`}
            >
              <Link href={`/c/${accessCode}`}>Back to Channel</Link>
            </Button>

            <Button asChild style={{ backgroundColor: primaryColor }}>
              <Link href="/access-code">Use Different Access Code</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>
            If you need immediate assistance or are in danger, please contact local emergency
            services.
          </p>
        </div>
      </div>
    </div>
  );
}

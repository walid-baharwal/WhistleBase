"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, CheckCircle2 } from "lucide-react";
import { createKeyDownloadContent } from "@/utils/keys";

interface CaseKeyDisplayProps {
  accessKey: string;
  caseId: string;
  channelTitle: string;
  accessCode: string;
  primaryColor: string;
}

export default function CaseKeyDisplay({
  accessKey,
  caseId,
  channelTitle,
  accessCode,
  primaryColor,
}: CaseKeyDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accessKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleDownload = () => {
    const content = createKeyDownloadContent(accessKey, caseId, channelTitle, accessCode);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `whistlebase-case-${caseId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-blue-50 p-6 rounded-lg mb-8">
      <h2 className="text-lg font-semibold text-blue-800 mb-2">Your Case Reference Key</h2>
      <p className="text-blue-700 text-sm mb-4">
        Download or copy and safely store this key. Without it, you won&apos;t be able to check the
        case or communicate further with your organization!
      </p>

      <div className="bg-white p-4 rounded-lg border-2 border-blue-200 mb-4">
        <div className="text-center">
          <div className="text-sm font-mono font-bold text-gray-800 break-all p-2 bg-gray-50 rounded border max-h-32 overflow-y-auto">
            {accessKey}
          </div>
          <div className="text-xs text-gray-500 mt-2">Your Case Reference Key</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleCopy}
          variant="default"
          className="flex-1"
          style={{ backgroundColor: primaryColor }}
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </>
          )}
        </Button>

        <Button
          onClick={handleDownload}
          variant="default"
          className="flex-1"
          style={{ backgroundColor: primaryColor }}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}

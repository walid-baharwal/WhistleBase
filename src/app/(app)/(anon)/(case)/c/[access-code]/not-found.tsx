import React from "react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CaseNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">Access Code Not Found</h1>
        <p className="text-gray-600 mb-8">
          The access code you entered is invalid or the reporting channel is no longer active.
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Please check your access code and try again, or contact the organization that provided
            it.
          </p>

          <Button asChild className="w-full">
            <Link href="/access-code">Try Another Access Code</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

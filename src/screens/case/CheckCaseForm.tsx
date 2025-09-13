"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { unmergeKeys } from "@/utils/keys";
import { storeTemporaryKeys } from "@/utils/keys/ls-keys";
import { checkCase } from "@/lib/actions/check-case";

interface CheckCaseFormProps {
  accessCode: string;
  primaryColor: string;
  error?: string;
}

export default function CheckCaseForm({ accessCode, primaryColor, error }: CheckCaseFormProps) {
  const [validationError, setValidationError] = useState<string | null>(error || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setValidationError(null);

    try {
      const accessKey = formData.get("access_key") as string;

      if (!accessKey) {
        setValidationError("Please provide a valid access key");
        setIsSubmitting(false);
        return;
      }

      const keys = unmergeKeys(accessKey);

      const [realPublicKey, caseId] = keys?.publicKey?.split(":") || [];

      if (!realPublicKey || !caseId) {
        setValidationError("Invalid access key format");
        setIsSubmitting(false);
        return;
      }
      storeTemporaryKeys(realPublicKey, keys?.privateKey || "");


      const result = await checkCase(realPublicKey, caseId, accessCode);
      if (result.success) {
        window.location.href = result.redirectUrl;
      } else {
        setValidationError(result?.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
        setValidationError(error.message);
      } else {
        setValidationError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <>
      {validationError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <form action={handleSubmit} className="space-y-6">
        <input type="hidden" name="access_code" value={accessCode} />

        <div className="space-y-2">
          <Label htmlFor="access_key">Case Reference Key</Label>
          <Input
            id="access_key"
            name="access_key"
            placeholder="Enter your case reference key"
            required
            className="w-full font-mono text-sm"
          />
          <p className="text-sm text-gray-500 text-center">
            This was provided when you submitted your report
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          style={{ backgroundColor: primaryColor }}
          disabled={isSubmitting}
        >
          <Search className="h-4 w-4 mr-2" />
          {isSubmitting ? "Checking..." : "Check Case Status"}
        </Button>
      </form>
    </>
  );
}

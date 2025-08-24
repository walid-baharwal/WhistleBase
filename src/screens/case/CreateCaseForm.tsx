"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createCase } from "@/lib/actions/case";
import SecurityMessage from "@/components/security-message";
import { useState } from "react";

interface CreateCaseFormProps {
  channel: {
    _id: string;
    title: string;
    description: string;
    primary_color: string;
    submission_message: string | null;
    organization_id: string;
  };
  accessCode: string;
  error?: string;
}

export default function CreateCaseForm({ channel, accessCode, error }: CreateCaseFormProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const validateForm = () => {
    if (!category.trim()) {
      setValidationError("Please enter a category for your report.");
      return false;
    }
    if (content.length < 10) {
      setValidationError(
        "Please provide more details about the incident (at least 10 characters)."
      );
      return false;
    }
    if (content.length > 5000) {
      setValidationError("Please shorten your description (maximum 5000 characters).");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (formData: FormData) => {
    setHasAttemptedSubmit(true);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting form data:", isSubmitting);
      await createCase(formData);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Form submission error:", error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-4xl">
        <h1
          className="text-3xl font-semibold mb-6 text-center"
          style={{ color: channel.primary_color }}
        >
          New Case
        </h1>

        <form action={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <input type="hidden" name="access_code" value={accessCode} />

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              placeholder="e.g., Harassment, Fraud, Safety Concern"
              required
              className="w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Description</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Please provide detailed information about the incident..."
              required
              className="w-full min-h-[200px]"
              maxLength={5000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              {content.length}/5000 characters (minimum 10 required)
            </p>
          </div>

          {((validationError && hasAttemptedSubmit) || error) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{validationError || error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            style={{ backgroundColor: channel.primary_color }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>

        <SecurityMessage />
      </div>
    </div>
  );
}

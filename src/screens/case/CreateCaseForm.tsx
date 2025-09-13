"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createCase } from "@/lib/actions/case";
import SecurityMessage from "@/components/security-message";
import { useState, useRef } from "react";
import { useUploadFile } from "@/helpers/uploadFile";
import { X, Upload, File } from "lucide-react";
import { ObjectId } from "bson";
import { generateCaseAccessKey } from "@/utils/keys";
import { initSodium } from "@/lib/sodium";
import { trpc } from "@/lib/trpc";
import { encryptFile, ivToBase64 } from "@/utils/attachment-encrption";
import { encryptCaseContent, generateAnonKeyPair } from "@/utils/content-encryption";

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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      name: string;
      size: number;
      type: string;
      storageKey: string;
    }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUploadFile();

  const utils = trpc.useUtils();

  const allowedExtensions = ["docx", "pdf", "csv", "jpeg", "jpg", "png", "webp"];

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

    if (selectedFiles.length > 5) {
      setValidationError("Maximum 5 files allowed.");
      return false;
    }

    for (const file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setValidationError(`File "${file.name}" is too large. Maximum size is 5MB.`);
        return false;
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setValidationError(
          `File "${file.name}" has an unsupported format. Allowed types: ${allowedExtensions.join(
            ", "
          )}`
        );
        return false;
      }
    }

    setValidationError("");
    return true;
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);

    if (selectedFiles.length + filesArray.length > 5) {
      setValidationError("Maximum 5 files allowed.");
      return;
    }

    for (const file of filesArray) {
      if (file.size > 5 * 1024 * 1024) {
        setValidationError(`File "${file.name}" is too large. Maximum size is 5MB.`);
        return;
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setValidationError(
          `File "${file.name}" has an unsupported format. Allowed types: ${allowedExtensions.join(
            ", "
          )}`
        );
        return;
      }
    }

    setSelectedFiles((prev) => [...prev, ...filesArray]);
    setValidationError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFilesOnSubmit = async (aesKey: Uint8Array) => {
    if (selectedFiles.length === 0) return { uploadedFiles: [], caseId: null };

    setIsUploading(true);

    const uploadedFilesData = [];

    const caseObjectId = new ObjectId();
    const caseId = caseObjectId.toString();

    try {
      for (const file of selectedFiles) {
        const { encrypted, iv } = await encryptFile(file, aesKey);
        const ivBase64 =  ivToBase64(iv);
        const encryptedBlob = new Blob([encrypted], { type: file.type });
        const result = await uploadFile(encryptedBlob, caseId);

        if (result.success && result.storageKey) {
          uploadedFilesData.push({
            name: file.name,
            size: file.size,
            type: file.type,
            storageKey: result.storageKey,
            iv: ivBase64,
          });
        } else {
          throw new Error(`Failed to upload "${file.name}"`);
        }
      }

      setUploadedFiles(uploadedFilesData);
      return { uploadedFiles: uploadedFilesData, caseId };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (formData: FormData) => {
    setHasAttemptedSubmit(true);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const sodium = await initSodium();
      const aesKey = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
      const keyPairResult = await generateAnonKeyPair();
      if (!keyPairResult) {
        throw new Error("Failed to generate encryption keys");
      }

      const orgKeyResult = await utils.channel.getOrgPublicKeyByAccessCode.fetch({
        accessCode: accessCode,
      });

      const orgPublicKey = sodium.from_base64(orgKeyResult.publicKey);

      const encryptionResult = await encryptCaseContent(
        content,
        keyPairResult.publicKey,
        orgPublicKey,
        aesKey
      );

      if (!encryptionResult) {
        throw new Error("Failed to encrypt case content");
      }

      const anonPublicKey = sodium.to_base64(keyPairResult.publicKey);
      const anonPrivateKey = sodium.to_base64(keyPairResult.privateKey);

      let filesData = uploadedFiles;
      let caseId: string | null = null;

      if (selectedFiles.length > 0) {
        const uploadResult = await uploadFilesOnSubmit(aesKey);
        filesData = uploadResult.uploadedFiles;
        caseId = uploadResult.caseId;
      }

      formData.append("attachments", JSON.stringify(filesData));
      formData.append("encryptedContent", encryptionResult.encryptedContent);
      formData.append("forAnonUser", encryptionResult.forAnonUser);
      formData.append("forAdmin", encryptionResult.forAdmin);
      formData.append("anonPublicKey", anonPublicKey);

      formData.delete("content");
      if (caseId) {
        formData.append("caseId", caseId);
      }

      const result = await createCase(formData);

      if (result && result.success && result.caseId) {
        const properAccessKey = generateCaseAccessKey(result.caseId, anonPublicKey, anonPrivateKey);

        window.location.href = `/c/${accessCode}/success?case_id=${
          result.caseId
        }&access_key=${encodeURIComponent(properAccessKey)}`;
      } else if (result && !result.success && result.error) {
        throw new Error(result.error);
      } else {
        throw new Error("Failed to submit case");
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Form submission error:", error);
      if (error instanceof Error) {
        setValidationError(`Submission failed: ${error.message}`);
      } else {
        setValidationError("Submission failed. Please try again.");
      }
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

          {}
          <div className="space-y-2">
            <Label htmlFor="files">Attachments (Optional)</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Upload up to 5 files (maximum 5 MB each)
                <br />
                Allowed types: DOCX, PDF, CSV, JPEG, JPG, PNG, WEBP
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelection}
                className="hidden"
                id="file-upload"
                accept=".docx,.pdf,.csv,.jpeg,.jpg,.png,.webp"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || selectedFiles.length >= 5}
                className="mt-2"
              >
                {isUploading
                  ? "Uploading..."
                  : selectedFiles.length >= 5
                  ? "Max files reached"
                  : "Select Files"}
              </Button>
            </div>

            {}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Selected Files ({selectedFiles.length}/5) -{" "}
                  {isUploading ? "Uploading..." : "Will upload on submit"}
                </p>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.type || "Unknown type"}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSelectedFile(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-blue-600">
              ℹ️ Attachments can break your anonymity, so we always try to remove all metadata from
              attachments. <span className="underline cursor-pointer">Learn more</span>
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

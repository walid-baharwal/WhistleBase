"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { File, ArrowLeft, Send, Download, Loader2, Upload, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { decryptCaseContent } from "@/utils/content-encryption";
import { encryptMessageFromAnonymous, decryptMessage } from "@/utils/message-encryption";
import { getAesKey } from "@/utils/content-encryption";
import { Separator } from "@/components/ui/separator";
import { getTemporaryKeys } from "@/utils/keys/ls-keys";
import { trpc } from "@/lib/trpc";
import { base64ToIv, decryptFile, encryptFile, ivToBase64 } from "@/utils/attachment-encrption";
import { useUploadFile } from "@/helpers/uploadFile";
import { Input } from "@/components/ui/input";

interface Attachment {
  _id: string;
  file_name: string;
  mime_type: string;
  size: number;
  storage_key: string;
}

export type MessageType = {
  _id: string;
  sender_type: "ANONYMOUS" | "ADMIN";
  message: string;
  attachments?: Array<{
    _id: string;
    file_name: string;
    mime_type: string;
    size: number;
    storage_key: string;
    iv: string;
  }>;
  createdAt: string;
};

export default function CaseViewPage() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("case_id");
  const accessCode = window.location.pathname.split("/")[2];
  const { publicKey, privateKey } = getTemporaryKeys() || {};
  const [decryptedContent, setDecryptedContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [aesKey, setAesKey] = useState<Uint8Array | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<{ [key: string]: string }>({});

  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [downloadingAttachment, setDownloadingAttachment] = useState<string | null>(null);

  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { uploadFile } = useUploadFile();

  const allowedExtensions = ["docx", "pdf", "csv", "jpeg", "jpg", "png", "webp"];

  const {
    data: caseData,
    isLoading,
    error: caseError,
    refetch: refetchCaseData,
  } = trpc.case.getCase.useQuery(
    { caseId: caseId || "", anonPublicKey: publicKey || "" },
    {
      enabled: !!caseId && !!publicKey && !!privateKey,
      staleTime: 10000,
      refetchInterval: 10000,
    }
  );

  useEffect(() => {
    if (caseError) {
      setError(caseError.message);
    }
  }, [caseError]);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [caseData?.messages, decryptedMessages, selectedFiles]);

  useEffect(() => {
    if (!caseId) {
      setError("Missing case ID");
      return;
    }

    if (!publicKey || !privateKey) {
      window.location.href = `/c/${accessCode}/check?error=${encodeURIComponent(
        "Session expired. Please enter your access key again."
      )}`;
      return;
    }

    if (caseData?.content && caseData?.forAnonUser) {
      const decryptContent = async () => {
        try {
          const decrypted = await decryptCaseContent(
            caseData?.content as string,
            caseData.forAnonUser as string,
            privateKey,
            publicKey
          );

          if (decrypted) {
            setDecryptedContent(decrypted);

            const messageAesKey = await getAesKey(
              caseData.forAnonUser as string,
              privateKey,
              publicKey
            );

            if (messageAesKey) {
              setAesKey(messageAesKey);

              const decrypted: { [key: string]: string } = {};
              for (const message of caseData.messages) {
                if (message.message.includes(":")) {
                  const decryptedMessage = await decryptMessage(message.message, messageAesKey);
                  if (decryptedMessage) {
                    decrypted[message._id] = decryptedMessage;
                  }
                } else {
                  decrypted[message._id] = message.message;
                }
              }
              setDecryptedMessages(decrypted);
            }
          } else {
            setError("Failed to decrypt case content");
          }
        } catch (err) {
          console.error("Error decrypting content:", err);
          setError("Failed to decrypt case content");
        }
      };

      decryptContent();
    }
  }, [caseId, publicKey, privateKey, accessCode, caseData]);

  const sendMessageMutation = trpc.case.sendMessage.useMutation({
    onSuccess: (messageData) => {
      if (caseData && aesKey) {
        setDecryptedMessages({
          ...decryptedMessages,
          [messageData._id]: newMessage,
        });
        setNewMessage("");
        setSelectedFiles([]);
        refetchCaseData();
      }
    },
    onError: (err) => {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    },
    onSettled: () => {
      setSendingMessage(false);
    },
  });

  const downloadAttachmentMutation = trpc.attachment.getDownloadUrl.useMutation({
    onSuccess: async (data: { url: string; fileName: string; mimeType: string; iv: string }) => {
      try {
        if (!aesKey) {
          throw new Error("AES key is not available for decryption");
        }

        const response = await fetch(data.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }

        const encryptedBuffer = await response.arrayBuffer();

        const iv = base64ToIv(data.iv);

        const decryptedBuffer = await decryptFile(encryptedBuffer, aesKey, iv);

        const decryptedBlob = new Blob([decryptedBuffer], { type: data.mimeType });
        const blobUrl = URL.createObjectURL(decryptedBlob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = data.fileName;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
          setDownloadingAttachment(null);
        }, 100);
      } catch (err) {
        console.error("Error downloading file:", err);
        setError("Failed to download file");
        setDownloadingAttachment(null);
      }
    },
    onError: (err) => {
      console.error("Error downloading attachment:", err);
      setError("Failed to download attachment");
      setDownloadingAttachment(null);
    },
  });

  const handleDownloadAttachment = (attachmentId: string) => {
    if (!publicKey) {
      setError("Authentication required");
      return;
    }

    if (!aesKey) {
      setError("Encryption key not available");
      return;
    }

    setDownloadingAttachment(attachmentId);
    setError(null);

    downloadAttachmentMutation.mutate({
      attachmentId,
      publicKey,
    });
  };

  const handleSendMessage = async () => {
    if (
      (!newMessage.trim() && selectedFiles.length === 0) ||
      !caseId ||
      !publicKey ||
      !privateKey ||
      !aesKey
    )
      return;

    setSendingMessage(true);
    try {
      const encryptedMessage = newMessage.trim()
        ? await encryptMessageFromAnonymous(newMessage, aesKey)
        : "";

      if (newMessage.trim() && !encryptedMessage) {
        throw new Error("Failed to encrypt message");
      }

      let attachments: Array<{
        file_name: string;
        size: number;
        mime_type: string;
        storage_key: string;
        iv: string;
      }> = [];

      if (selectedFiles.length > 0) {
        attachments = await uploadFilesForMessage(aesKey);
      }

      sendMessageMutation.mutate({
        caseId,
        message: encryptedMessage || "",
        senderType: "ANONYMOUS",
        publicKey,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
      setSendingMessage(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);

    if (selectedFiles.length + filesArray.length > 5) {
      setError("Maximum 5 files allowed.");
      return;
    }

    for (const file of filesArray) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is 5MB.`);
        return;
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setError(
          `File "${file.name}" has an unsupported format. Allowed types: ${allowedExtensions.join(
            ", "
          )}`
        );
        return;
      }
    }

    setSelectedFiles((prev) => [...prev, ...filesArray]);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFilesForMessage = async (aesKey: Uint8Array) => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);

    const uploadedFilesData = [];

    try {
      for (const file of selectedFiles) {
        const { encrypted, iv } = await encryptFile(file, aesKey);
        const ivBase64 = ivToBase64(iv);
        const encryptedBlob = new Blob([encrypted], { type: file.type });
        const result = await uploadFile(encryptedBlob, caseId!);

        if (result.success && result.storageKey) {
          uploadedFilesData.push({
            file_name: file.name,
            size: file.size,
            mime_type: file.type,
            storage_key: result.storageKey,
            iv: ivBase64,
          });
        } else {
          throw new Error(`Failed to upload "${file.name}"`);
        }
      }

      return uploadedFilesData;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "OPEN":
        return "default";
      case "CLOSED":
        return "secondary";
      default:
        return "default";
    }
  };

  const getJustificationVariant = (justification: string) => {
    switch (justification) {
      case "JUSTIFIED":
        return "default";
      case "UNJUSTIFIED":
        return "destructive";
      case "NONE":
        return "secondary";
      default:
        return "secondary";
    }
  };
  if (error) {
    console.log("error", error);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-muted p-6 rounded-lg max-w-lg w-full text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Case Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The case you&apos;re looking for could not be found. Please check your access key and
            try again.
          </p>
          <Button asChild variant="outline">
            <Link href={`/c/${accessCode}/check`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Check Page
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/c/${accessCode}/check`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Check Page
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-8">
        <Card className="overflow-hidden">
          <CardHeader className=" pb-4">
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">
                  Case #
                  {typeof caseData._id === "string"
                    ? caseData._id.substring(0, 6)
                    : String(caseData._id).substring(0, 6)}
                </span>
              </div>
              <Badge variant={getStatusVariant(caseData?.status as string)} className="px-3 py-1">
                {caseData?.status as string}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                <p className="font-medium text-foreground">{caseData?.category as string}</p>
              </div>

              {caseData.justification !== "NONE" && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Justification</h3>
                  <Badge
                    variant={getJustificationVariant(caseData?.justification as string)}
                    className="px-2 py-0.5"
                  >
                    {caseData?.justification as string}
                  </Badge>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Report Content</h3>
              <div className="bg-muted/30 p-4 rounded-md whitespace-pre-wrap text-sm border">
                {decryptedContent || "Content could not be decrypted"}
              </div>
            </div>

            {caseData &&
              "attachments" in caseData &&
              Array.isArray(caseData.attachments) &&
              caseData.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {caseData.attachments.map((attachment: Attachment) => (
                      <div
                        key={attachment._id}
                        className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <File className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[180px]">
                              {attachment?.file_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(attachment?.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={() => handleDownloadAttachment(attachment._id)}
                          disabled={downloadingAttachment === attachment._id}
                        >
                          {downloadingAttachment === attachment._id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        <Card className="flex flex-col h-[600px]">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2 scroll-smooth">
              {caseData?.messages && caseData.messages.length > 0 ? (
                caseData.messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender_type === "ANONYMOUS" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-lg shadow-sm whitespace-pre-wrap ${
                        message.sender_type === "ANONYMOUS"
                          ? "bg-primary/80 text-white "
                          : "bg-primary/20"
                      }`}
                    >
                      <div className="text-[15px] text-wrap  break-words ">
                        {decryptedMessages[message._id]}
                      </div>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment, attachmentIndex) => (
                            <div
                              key={attachmentIndex}
                              className="flex items-center justify-between p-2 bg-background/50 rounded border"
                            >
                              <div className="flex items-center space-x-2">
                                <File className="h-3 w-3 text-muted-foreground" />
                                <div>
                                  <p className="text-xs font-medium">{attachment.file_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className=" hover:text-black bg-transparent"
                                onClick={() => handleDownloadAttachment(attachment._id)}
                                disabled={downloadingAttachment === attachment._id}
                              >
                                {downloadingAttachment === attachment._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Download className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        className={`text-xs mt-2 ${
                          message.sender_type === "ADMIN" ? "text-muted-foreground" : "text-white"
                        }`}
                      >
                        {message.sender_type === "ADMIN" ? "Admin" : "You"}
                      </div>

                      <div
                        className={`text-xs  ${
                          message.sender_type === "ANONYMOUS"
                            ? "text-white "
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg font-medium mb-1">No messages yet</p>
                    <p className="text-sm">Start the conversation by sending a message</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <Separator className="my-4" />

            <div className="flex-shrink-0">
              {selectedFiles.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Selected Files ({selectedFiles.length}/5)
                  </p>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-lg border"
                    >
                      <div className="flex items-center space-x-2">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • {file.type || "Unknown type"}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSelectedFile(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={isUploading || sendingMessage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex space-x-2 ">
                <div className="flex-grow">
                  <div className="relative">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelection}
                      className="hidden"
                      accept=".docx,.pdf,.csv,.jpeg,.jpg,.png,.webp"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || sendingMessage || selectedFiles.length >= 5}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 z-10 hover:bg-muted"
                      title={selectedFiles.length >= 5 ? "Maximum files reached" : "Attach files"}
                    >
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Textarea
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[40px] pl-12 pr-4 resize-none"
                      disabled={sendingMessage || isUploading}
                      rows={1}
                    />
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {selectedFiles.length}/5 files attached
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    (!newMessage.trim() && selectedFiles.length === 0) ||
                    sendingMessage ||
                    isUploading
                  }
                  className="self-end  px-4"
                  title="Send message (Enter)"
                >
                  {sendingMessage ? (
                    <div className="animate-spin h-4 w-4 border-2 border-primary-foreground rounded-full border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

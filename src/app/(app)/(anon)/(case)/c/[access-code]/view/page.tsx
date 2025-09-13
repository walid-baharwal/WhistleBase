"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { File, ArrowLeft, Send, Download } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { decryptCaseContentForAnonUser } from "@/utils/content-encryption";
import {
  encryptMessageFromAnonymous,
  decryptMessage,
  getAesKeyForMessages,
} from "@/utils/message-encryption";
import { Separator } from "@/components/ui/separator";
import { getTemporaryKeys } from "@/utils/keys/ls-keys";


interface Attachment {
  _id: string;
  file_name: string;
  mime_type: string;
  size: number;
  storage_key: string;
}

interface Message {
  _id: string;
  sender_type: "ANONYMOUS" | "ADMIN";
  message: string;
  createdAt: string;
}

interface CaseData {
  _id: string;
  category: string;
  content: string;
  status: "OPEN" | "CLOSED";
  justification: "JUSTIFIED" | "UNJUSTIFIED" | "NONE";
  forAnonUser: string;
  attachments: Attachment[];
  messages: Message[];
}

export default function CaseViewPage() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("case_id");
  const accessCode = window.location.pathname.split("/")[2]; 
  const { publicKey, privateKey } = getTemporaryKeys() || {};
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [aesKey, setAesKey] = useState<Uint8Array | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<{ [key: string]: string }>({});


  useEffect(() => {
    const fetchCaseData = async () => {
      if (!caseId) {
        setError("Missing case ID");
        setLoading(false);
        return;
      }
      
      if (!publicKey || !privateKey) {
     
        window.location.href = `/c/${accessCode}/check?error=${encodeURIComponent("Session expired. Please enter your access key again.")}`;
        return;
      }

      try {
        const response = await fetch(`/api/cases/${caseId}?access_code=${accessCode}`);
        if (!response.ok) {
          throw new Error("Failed to fetch case data");
        }

        const data = await response.json();
        setCaseData(data);

     
        if (data.content && data.forAnonUser) {
          const decrypted = await decryptCaseContentForAnonUser(
            data.content,
            data.forAnonUser,
            privateKey,
            publicKey
          );

          if (decrypted) {
            setDecryptedContent(decrypted);

        
            const messageAesKey = await getAesKeyForMessages(
              data.forAnonUser,
              privateKey,
              publicKey
            );

            if (messageAesKey) {
              setAesKey(messageAesKey);

              const decrypted: { [key: string]: string } = {};
              for (const message of data.messages) {
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
        }
      } catch (err) {
        console.error("Error fetching case:", err);
        setError("Failed to load case data");
      } finally {
        setLoading(false);
      }
    };

    fetchCaseData();
  }, [caseId, publicKey, privateKey, accessCode]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !caseId || !publicKey || !privateKey || !aesKey) return;

    setSendingMessage(true);
    try {
    
      const encryptedMessage = await encryptMessageFromAnonymous(newMessage, aesKey);

      if (!encryptedMessage) {
        throw new Error("Failed to encrypt message");
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          case_id: caseId,
          message: encryptedMessage,
          sender_type: "ANONYMOUS",
          public_key: publicKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const messageData = await response.json();

      if (caseData) {
        const newMessageObj: Message = {
          _id: messageData._id,
          sender_type: "ANONYMOUS",
          message: encryptedMessage,
          createdAt: messageData.createdAt,
        };

        setCaseData({
          ...caseData,
          messages: [...caseData.messages, newMessageObj],
        });

        setDecryptedMessages({
          ...decryptedMessages,
          [messageData._id]: newMessage,
        });
      }

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    } finally {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-500";
      case "CLOSED":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const getJustificationColor = (justification: string) => {
    switch (justification) {
      case "JUSTIFIED":
        return "bg-green-500";
      case "UNJUSTIFIED":
        return "bg-red-500";
      case "NONE":
        return "bg-yellow-500";
      default:
        return "bg-yellow-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 p-6 rounded-lg max-w-lg w-full text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
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

  if (!caseData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-yellow-50 p-6 rounded-lg max-w-lg w-full text-center">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Case Not Found</h2>
          <p className="text-yellow-600 mb-4">
            The case you&apos;re looking for could not be found. Please check your access key and try again.
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
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/c/${accessCode}/check`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Check Page
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Case #{caseData._id.substring(0, 6)}</span>
                <Badge className={getStatusColor(caseData.status)}>{caseData.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="font-medium">{caseData.category}</p>
              </div>

              {caseData.justification !== "NONE" && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Justification</h3>
                  <Badge className={getJustificationColor(caseData.justification)}>
                    {caseData.justification}
                  </Badge>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500">Report Content</h3>
                <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap text-sm">
                  {decryptedContent || "Content could not be decrypted"}
                </div>
              </div>

              {caseData.attachments && caseData.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Attachments</h3>
                  <div className="space-y-2 mt-2">
                    {caseData.attachments.map((attachment) => (
                      <div
                        key={attachment._id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <File className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium truncate max-w-[150px]">
                              {attachment.file_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="flex-grow overflow-y-auto mb-4 space-y-4">
                {caseData.messages && caseData.messages.length > 0 ? (
                  caseData.messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender_type === "ANONYMOUS" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender_type === "ANONYMOUS"
                            ? "bg-blue-100 text-blue-900"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="text-sm">
                          {decryptedMessages[message._id] || "Unable to decrypt message"}
                        </div>
                        <div className="text-xs mt-1 opacity-70">
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500">
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation by sending a message</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex space-x-2">
                <Textarea
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow"
                  disabled={sendingMessage}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sendingMessage}>
                  {sendingMessage ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

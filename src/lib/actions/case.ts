"use server";

import dbConnect from "@/lib/dbConnect";
import ChannelModel from "@/models/channel.model";
import CaseModel from "@/models/case.model";
import OrganizationModel from "@/models/organization.model";
import AttachmentModel from "@/models/attachment.model";
import { createCaseSchema } from "@/schemas/case.schema";
import { ObjectId } from "bson";

export async function createCase(formData: FormData) {
  try {
    await dbConnect();

    const category = formData.get("category") as string;
    const accessCode = formData.get("access_code") as string;
    const attachmentsData = formData.get("attachments") as string;
    const preGeneratedCaseId = formData.get("caseId") as string;

    const clientEncryptedContent = formData.get("encryptedContent") as string;
    const clientForAnonUser = formData.get("forAnonUser") as string;
    const clientForAdmin = formData.get("forAdmin") as string;
    const clientAnonPublicKey = formData.get("anonPublicKey") as string;

    let attachments: Array<{
      name: string;
      size: number;
      type: string;
      storageKey: string;
      iv: string;
    }> = [];

    if (attachmentsData) {
      try {
        attachments = JSON.parse(attachmentsData);
      } catch (error) {
        console.error("Failed to parse attachments data:", error);
      }
    }

    const validation = createCaseSchema.safeParse({
      category,
      access_code: accessCode,
    });

    if (!validation.success) {
      const errors = validation.error.errors;
      let errorMessage = "Please check the following:";

      if (errors.some((e) => e.path.includes("category"))) {
        errorMessage = "Please enter a category for your report.";
      }

      throw new Error(errorMessage);
    }

    const isClientSideEncryption =
      clientEncryptedContent && clientForAnonUser && clientForAdmin && clientAnonPublicKey;

    if (!isClientSideEncryption) {
      throw new Error(
        "Client-side encryption is required for security. Please refresh and try again."
      );
    }

    if (!clientEncryptedContent.includes(":")) {
      throw new Error("Invalid encrypted content format");
    }

    const validatedData = validation.data;

    const channel = await ChannelModel.findOne({
      access_code: validatedData.access_code,
      is_active: true,
    }).populate("organization_id");

    if (!channel) {
      throw new Error("Access code is invalid. Please check your access code and try again.");
    }

    const organization = await OrganizationModel.findById(channel.organization_id);
    if (!organization) {
      throw new Error("Organization not found for this channel.");
    }

    let newCase;

    if (preGeneratedCaseId) {
      newCase = new CaseModel({
        _id: new ObjectId(preGeneratedCaseId),
        channel_id: channel._id,
        organization_id: organization._id,
        anon_public_key: clientAnonPublicKey,
        category: validatedData.category,
        content: clientEncryptedContent,
        status: "OPEN",
        justification: "NONE",
        forAnonUser: clientForAnonUser,
        forAdmin: clientForAdmin,
      });
      await newCase.save();
    } else {
      newCase = await CaseModel.create({
        channel_id: channel._id,
        organization_id: organization._id,
        anon_public_key: clientAnonPublicKey,
        category: validatedData.category,
        content: clientEncryptedContent,
        status: "OPEN",
        justification: "NONE",
        forAnonUser: clientForAnonUser,
        forAdmin: clientForAdmin,
      });
    }

    if (attachments.length > 0) {
      const attachmentDocuments = attachments.map((attachment) => ({
        case_id: newCase._id,
        organization_id: channel.organization_id?._id,
        iv: attachment.iv,
        file_name: attachment.name,
        storage_key: attachment.storageKey,
        mime_type: attachment.type || "application/octet-stream",
        size: attachment.size,
        uploaded_by: null,
        uploaded_at: new Date(),
      }));

      await AttachmentModel.create(attachmentDocuments);
    }

    const caseId = String(newCase._id);

    return {
      success: true,
      caseId: caseId,
      accessCode: accessCode,
    };
  } catch (error) {
    console.error("Case creation error:", error);

    if (error instanceof Error) {
      if (error.message.includes("NEXT_REDIRECT")) {
        throw error;
      }

      const accessCode = formData.get("access_code") as string;
      return { success: false, error: error.message, accessCode };
    } else {
      const accessCode = formData.get("access_code") as string;
      return { success: false, error: "Something went wrong. Please try again.", accessCode };
    }
  }
}

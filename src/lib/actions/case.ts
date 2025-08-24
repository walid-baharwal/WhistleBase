"use server";

import dbConnect from "@/lib/dbConnect";
import ChannelModel from "@/models/channel.model";
import CaseModel from "@/models/case.model";
import OrganizationModel from "@/models/organization.model";
import { createCaseSchema } from "@/schemas/case.schema";
import { initSodiumServer } from "@/lib/sodium-server";
import { redirect } from "next/navigation";
import { generateCaseAccessKey } from "@/utils/keys";
import { encryptCaseContent } from "@/utils/content-encryption";

export async function createCase(formData: FormData) {
  try {
    await dbConnect();

    const category = formData.get("category") as string;
    const content = formData.get("content") as string;
    const accessCode = formData.get("access_code") as string;

    const validation = createCaseSchema.safeParse({
      category,
      content,
      access_code: accessCode,
    });

    if (!validation.success) {
      const errors = validation.error.errors;
      let errorMessage = "Please check the following:";

      if (errors.some((e) => e.path.includes("category"))) {
        errorMessage = "Please enter a category for your report.";
      } else if (errors.some((e) => e.path.includes("content"))) {
        const contentError = errors.find((e) => e.path.includes("content"));
        if (contentError?.message.includes("10 characters")) {
          errorMessage = "Please provide more details about the incident (at least 10 characters).";
        } else if (contentError?.message.includes("5000 characters")) {
          errorMessage = "Please shorten your description (maximum 5000 characters).";
        }
      }

      throw new Error(errorMessage);
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

    const sodium = await initSodiumServer();
    const orgPublicKey = sodium.from_base64(organization.public_key);

    const keyPair = sodium.crypto_box_keypair();

    const encryptionResult = await encryptCaseContent(
      validatedData.content,
      keyPair?.publicKey,
      orgPublicKey
    );

    const anonPublicKey = sodium.to_base64(keyPair.publicKey);
    const anonPrivateKey = sodium.to_base64(keyPair.privateKey);

    if (!encryptionResult) {
      throw new Error("Failed to encrypt case content. Please try again.");
    }

    const newCase = await CaseModel.create({
      channel_id: channel._id,
      anon_public_key: anonPublicKey,
      category: validatedData.category,
      content: encryptionResult.encryptedContent,
      status: "OPEN",
      justification: "NONE",
      forSender: encryptionResult.forSender,
      forReceiver: encryptionResult.forReceiver,
    });

    const caseId = String(newCase._id);
    const accessKey = generateCaseAccessKey(caseId, anonPublicKey, anonPrivateKey);

    redirect(
      `/c/${accessCode}/success?case_id=${caseId}&access_key=${encodeURIComponent(accessKey)}`
    );
  } catch (error) {
    console.log("error case creation", error);

    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "Something went wrong. Please try again.";
    }

    const accessCode = formData.get("access_code") as string;
    redirect(`/c/${accessCode}/create?error=${encodeURIComponent(errorMessage)}`);
  }
}

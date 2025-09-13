"use server";

import dbConnect from "@/lib/dbConnect";
import CaseModel from "@/models/case.model";

export async function checkCase(publicKey: string, caseId: string, accessCode: string) {
  try {
    await dbConnect();

    if (!publicKey || !caseId || !accessCode) {
      throw new Error("Please provide a valid anon public key and case id");
    }

    const foundCase = await CaseModel.findOne({ anon_public_key: publicKey, _id: caseId }).lean();

    if (!foundCase?._id) {
      throw new Error("Case not found. Please check your access key and try again.");
    }

    return { success: true, redirectUrl: `/c/${accessCode}/view?case_id=${caseId}` };
  } catch (error) {
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "Something went wrong. Please try again.";
    }
    console.log("errorMessage", errorMessage);

    return {
      success: false,
      error: errorMessage,
      redirectUrl: `/c/${accessCode}/check?error=${encodeURIComponent(errorMessage)}`,
    };
  }
}

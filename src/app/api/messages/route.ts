import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CaseModel from "@/models/case.model";
import MessageModel from "@/models/message.model";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { case_id, message, sender_type, public_key } = body;
    
    if (!case_id || !message || !sender_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
 
    const caseData = await CaseModel.findById(case_id);
    if (!caseData) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }
    

    if (sender_type === "ANONYMOUS" && public_key !== caseData.anon_public_key) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const newMessage = await MessageModel.create({
      case_id,
      sender_type,
      sender_id: null,
      message,
    });
    
    const doc = newMessage as unknown as mongoose.Document & {
      createdAt: Date;
    };
    
    const messageId = (newMessage as unknown as mongoose.Document & { _id: mongoose.Types.ObjectId })._id;
    const messageCaseId = (newMessage as unknown as mongoose.Document & { case_id: mongoose.Types.ObjectId }).case_id;
    
    return NextResponse.json({
      _id: messageId.toString(),
      case_id: messageCaseId.toString(),
      sender_type: newMessage.sender_type,
      message: newMessage.message,
      createdAt: doc.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}

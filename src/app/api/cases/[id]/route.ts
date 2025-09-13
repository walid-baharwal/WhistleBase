import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CaseModel from "@/models/case.model";
import ChannelModel from "@/models/channel.model";
import AttachmentModel from "@/models/attachment.model";
import MessageModel from "@/models/message.model";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const caseId = params.id;
    
    
    const { searchParams } = new URL(request.url);
    const accessCode = searchParams.get("access_code");
    
    if (!accessCode) {
      return NextResponse.json(
        { error: "Access code is required" },
        { status: 400 }
      );
    }

  
    const channel = await ChannelModel.findOne({
      access_code: accessCode,
      is_active: true,
    }).lean();

    if (!channel) {
      return NextResponse.json(
        { error: "Invalid access code" },
        { status: 404 }
      );
    }

  
    const caseData = await CaseModel.findById(caseId).lean();
    
    if (!caseData) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

  
    if (caseData.channel_id.toString() !== channel._id.toString()) {
      return NextResponse.json(
        { error: "Case not found in this channel" },
        { status: 404 }
      );
    }


    const attachments = await AttachmentModel.find({
      case_id: caseId,
    }).lean();

 
    const messages = await MessageModel.find({
      case_id: caseId,
    })
      .sort({ createdAt: 1 })
      .lean();

 
    const formattedCase = {
      ...caseData,
      _id: caseData._id.toString(),
      channel_id: caseData.channel_id.toString(),
      attachments: attachments.map(attachment => ({
        ...attachment,
        _id: attachment._id.toString(),
        case_id: attachment.case_id.toString(),
        organization_id: attachment.organization_id.toString(),
        uploaded_by: attachment.uploaded_by ? attachment.uploaded_by.toString() : null,
      })),
      messages: messages.map(message => {
        const doc = message as unknown as mongoose.Document & {
          createdAt: Date;
          updatedAt: Date;
        };
        return {
          ...message,
          _id: message._id.toString(),
          case_id: message.case_id.toString(),
          sender_id: message.sender_id ? message.sender_id.toString() : null,
          createdAt: doc.createdAt.toISOString(),
          updatedAt: doc.updatedAt.toISOString(),
        };
      }),
    };

    return NextResponse.json(formattedCase);
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json(
      { error: "Failed to fetch case data" },
      { status: 500 }
    );
  }
}

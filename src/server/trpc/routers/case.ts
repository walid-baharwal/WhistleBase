import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../context";
import CaseModel from "@/models/case.model";
import MessageModel from "@/models/message.model";
import OrganizationModel from "@/models/organization.model";
import mongoose from "mongoose";
import AttachmentModel from "@/models/attachment.model";

export const caseRouter = createTRPCRouter({
  getCase: publicProcedure
    .input(
      z.object({
        caseId: z.string(),
        anonPublicKey: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { caseId, anonPublicKey } = input;

      const caseData = await CaseModel.findOne({
        _id: caseId,
        anon_public_key: anonPublicKey,
      }).lean();

      const attachments = await AttachmentModel.find({
        case_id: caseId,
      }).lean();

      if (!caseData) {
        throw new Error("Case not found");
      }

      const messages = (await MessageModel.find({
        case_id: caseId,
      })
        .sort({ createdAt: 1 })
        .lean()) as unknown as {
        _id: mongoose.Types.ObjectId;
        case_id: mongoose.Types.ObjectId;
        sender_type: "ANONYMOUS" | "ADMIN";
        message: string;
        createdAt: Date;
        [key: string]: unknown;
      }[];

      const messageAttachments = await AttachmentModel.find({
        case_id: caseId,
        message_id: { $ne: null },
      }).lean();

      const result: {
        _id: string;

        messages: {
          _id: string;
          case_id: string;
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
        }[];
        attachments: {
          _id: string;
          file_name: string;
          mime_type: string;
          size: number;
          storage_key: string;
        }[];
        [key: string]: unknown;
      } = {
        ...(caseData as unknown as { [key: string]: unknown }),
        _id: caseData._id.toString(),
        messages: messages.map((msg) => {
          const msgAttachments = messageAttachments.filter(
            (att) => att.message_id?.toString() === msg._id.toString()
          );

          return {
            ...msg,
            _id: msg._id.toString(),
            case_id: msg.case_id.toString(),
            createdAt: msg.createdAt.toISOString(),
            attachments: msgAttachments.map((att) => ({
              _id: att._id.toString(),
              file_name: att.file_name,
              mime_type: att.mime_type,
              size: att.size,
              storage_key: att.storage_key,
              iv: att.iv,
            })),
          };
        }),
        attachments: [],
      };

      result.attachments = attachments.map((attachment: unknown) => {
        const att = attachment as {
          _id: mongoose.Types.ObjectId;
          file_name: string;
          mime_type: string;
          size: number;
          storage_key: string;
        };
        return {
          _id: att._id.toString(),
          file_name: att.file_name,
          mime_type: att.mime_type,
          size: att.size,
          storage_key: att.storage_key,
        };
      });

      return result;
    }),

  sendMessage: publicProcedure
    .input(
      z.object({
        caseId: z.string(),
        message: z.string().optional(),
        senderType: z.enum(["ANONYMOUS", "ADMIN"]),
        publicKey: z.string(),
        attachments: z
          .array(
            z.object({
              file_name: z.string(),
              mime_type: z.string(),
              size: z.number(),
              storage_key: z.string(),
              iv: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { caseId, message, senderType, publicKey, attachments } = input;

      const caseData = await CaseModel.findById(caseId);
      if (!caseData) {
        throw new Error("Case not found");
      }

      if (senderType === "ANONYMOUS" && publicKey !== caseData.anon_public_key) {
        throw new Error("Unauthorized");
      }

      const newMessage = await MessageModel.create({
        case_id: caseId,
        sender_type: senderType,
        sender_id: null,
        message,
      });

      if (attachments && attachments.length > 0) {
        await AttachmentModel.insertMany(
          attachments.map((attachment) => ({
            case_id: caseId,
            organization_id: caseData.organization_id,
            message_id: newMessage._id,
            file_name: attachment.file_name,
            storage_key: attachment.storage_key,
            mime_type: attachment.mime_type,
            size: attachment.size,
            iv: attachment.iv,
            uploaded_by: null,
            uploaded_at: new Date(),
          }))
        );
      }

      const messageDoc = newMessage as unknown as {
        createdAt: Date;
        _id: mongoose.Types.ObjectId;
        case_id: mongoose.Types.ObjectId;
        sender_type: "ANONYMOUS" | "ADMIN";
        message: string;
      };

      return {
        _id: messageDoc._id.toString(),
        case_id: messageDoc.case_id.toString(),
        sender_type: messageDoc.sender_type,
        message: messageDoc.message,
        createdAt: messageDoc.createdAt.toISOString(),
      };
    }),

  getAllCasesByOrganization: protectedProcedure.query(async ({ ctx }) => {
    const organizationId = ctx.session.user.organization_id;

    if (!organizationId) {
      throw new Error("Organization not found");
    }

    const cases = await CaseModel.find({
      organization_id: organizationId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return cases.map((caseItem) => ({
      ...caseItem,
      _id: caseItem._id.toString(),
      organization_id: caseItem.organization_id.toString(),
      createdAt:
        (caseItem as { createdAt?: Date }).createdAt?.toISOString() || new Date().toISOString(),
      updatedAt:
        (caseItem as { updatedAt?: Date }).updatedAt?.toISOString() || new Date().toISOString(),
    }));
  }),

  getAdminCase: protectedProcedure
    .input(
      z.object({
        caseId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { caseId } = input;
      const organizationId = ctx.session.user.organization_id;

      if (!organizationId) {
        throw new Error("Organization not found");
      }

      const caseData = await CaseModel.findOne({
        _id: caseId,
        organization_id: organizationId,
      }).lean();

      if (!caseData) {
        throw new Error("Case not found");
      }

      const organization = await OrganizationModel.findById(organizationId);
      if (!organization) {
        throw new Error("Organization not found");
      }

      const attachments = await AttachmentModel.find({
        case_id: caseId,
        message_id: null,
      }).lean();

      const messages = (await MessageModel.find({
        case_id: caseId,
      })
        .sort({ createdAt: 1 })
        .lean()) as unknown as {
        _id: mongoose.Types.ObjectId;
        case_id: mongoose.Types.ObjectId;
        sender_type: "ANONYMOUS" | "ADMIN";
        message: string;
        createdAt: Date;
        [key: string]: unknown;
      }[];

      const messageAttachments = await AttachmentModel.find({
        case_id: caseId,
        message_id: { $ne: null },
      }).lean();

      const result = {
        ...caseData,
        _id: caseData._id.toString(),
        organization_id: caseData.organization_id.toString(),
        organization_public_key: organization.public_key,
        createdAt:
          (caseData as { createdAt?: Date })?.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt:
          (caseData as { updatedAt?: Date })?.updatedAt?.toISOString() || new Date().toISOString(),
        messages: messages.map((msg) => {
          const msgAttachments = messageAttachments.filter(
            (att) => att.message_id?.toString() === msg._id.toString()
          );

          return {
            ...msg,
            _id: msg._id.toString(),
            case_id: msg.case_id.toString(),
            createdAt: msg.createdAt.toISOString(),
            attachments: msgAttachments.map((att) => ({
              _id: att._id.toString(),
              file_name: att.file_name,
              mime_type: att.mime_type,
              size: att.size,
              storage_key: att.storage_key,
              iv: att.iv,
            })),
          };
        }),
        attachments: attachments.map((attachment) => ({
          _id: attachment._id.toString(),
          file_name: attachment.file_name,
          mime_type: attachment.mime_type,
          size: attachment.size,
          storage_key: attachment.storage_key,
          iv: attachment.iv,
        })),
      };

      return result;
    }),

  updateCaseStatus: protectedProcedure
    .input(
      z.object({
        caseId: z.string(),
        status: z.enum(["OPEN", "CLOSED"]),
        justification: z.enum(["JUSTIFIED", "UNJUSTIFIED", "NONE"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { caseId, status, justification } = input;
      const organizationId = ctx.session.user.organization_id;

      if (!organizationId) {
        throw new Error("Organization not found");
      }

      const updateData: { status: string; justification?: string } = { status };
      if (justification !== undefined) {
        updateData.justification = justification;
      }

      const updatedCase = await CaseModel.findOneAndUpdate(
        {
          _id: caseId,
          organization_id: organizationId,
        },
        updateData,
        { new: true }
      );

      if (!updatedCase) {
        throw new Error("Case not found");
      }

      return {
        success: true,
        case: {
          ...updatedCase.toObject(),
          _id: updatedCase._id?.toString(),
          organization_id: updatedCase.organization_id.toString(),
        },
      };
    }),

  sendAdminMessage: protectedProcedure
    .input(
      z.object({
        caseId: z.string(),
        message: z.string(),
        attachments: z
          .array(
            z.object({
              file_name: z.string(),
              mime_type: z.string(),
              size: z.number(),
              storage_key: z.string(),
              iv: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { caseId, message, attachments } = input;
      const organizationId = ctx.session.user.organization_id;
      const userId = ctx.session.user._id;

      if (!organizationId) {
        throw new Error("Organization not found");
      }

      const caseData = await CaseModel.findOne({
        _id: caseId,
        organization_id: organizationId,
      });

      if (!caseData) {
        throw new Error("Case not found");
      }

      const newMessage = await MessageModel.create({
        case_id: caseId,
        sender_type: "ADMIN",
        sender_id: userId,
        message,
      });

      if (attachments && attachments.length > 0) {
        await AttachmentModel.insertMany(
          attachments.map((attachment) => ({
            case_id: caseId,
            organization_id: organizationId,
            message_id: newMessage._id,
            file_name: attachment.file_name,
            storage_key: attachment.storage_key,
            mime_type: attachment.mime_type,
            size: attachment.size,
            iv: attachment.iv,
            uploaded_by: userId,
            uploaded_at: new Date(),
          }))
        );
      }

      return {
        _id: newMessage?._id?.toString(),
        case_id: newMessage.case_id.toString(),
        sender_type: newMessage.sender_type,
        message: newMessage.message,
        createdAt: newMessage.createdAt.toISOString(),
      };
    }),

  getDashboardAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const organizationId = ctx.session.user.organization_id;

    if (!organizationId) {
      throw new Error("Organization not found");
    }

    const ChannelModel = (await import("@/models/channel.model")).default;

    const totalCases = await CaseModel.countDocuments({
      organization_id: organizationId,
    });

    const totalChannels = await ChannelModel.countDocuments({
      organization_id: organizationId,
    });

    const openCases = await CaseModel.countDocuments({
      organization_id: organizationId,
      status: "OPEN",
    });

    const closedCases = await CaseModel.countDocuments({
      organization_id: organizationId,
      status: "CLOSED",
    });

    const justifiedCases = await CaseModel.countDocuments({
      organization_id: organizationId,
      justification: "JUSTIFIED",
    });

    const unjustifiedCases = await CaseModel.countDocuments({
      organization_id: organizationId,
      justification: "UNJUSTIFIED",
    });

    return {
      totalCases,
      totalChannels,
      openCases,
      closedCases,
      justifiedCases,
      unjustifiedCases,
    };
  }),

  getLatestCases: protectedProcedure
    .input(z.object({ limit: z.number().optional().default(5) }))
    .query(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organization_id;

      if (!organizationId) {
        throw new Error("Organization not found");
      }

      const cases = await CaseModel.find({
        organization_id: organizationId,
      })
        .sort({ createdAt: -1 })
        .limit(input.limit)
        .lean();

      return cases.map((caseItem) => ({
        ...caseItem,
        _id: caseItem._id.toString(),
        organization_id: caseItem.organization_id.toString(),
        createdAt:
          (caseItem as { createdAt?: Date }).createdAt?.toISOString() || new Date().toISOString(),
        updatedAt:
          (caseItem as { updatedAt?: Date }).updatedAt?.toISOString() || new Date().toISOString(),
      }));
    }),
});

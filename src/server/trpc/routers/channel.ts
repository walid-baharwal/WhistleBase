import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/trpc/context";
import { channelSchema } from "@/schemas/channel.schema";
import ChannelModel from "@/models/channel.model";
import OrganizationModel from "@/models/organization.model";

export const channelRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const channels = await ChannelModel.find({
      organization_id: ctx.session.user.organization_id,
    }).sort({ createdAt: -1 });

    return channels;
  }),

  create: protectedProcedure.input(channelSchema).mutation(async ({ ctx, input }) => {
    const channel = await ChannelModel.create({
      ...input,
      organization_id: ctx.session.user.organization_id,
    });

    return channel;
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: channelSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const channel = await ChannelModel.findOneAndUpdate(
        {
          _id: input.id,
          organization_id: ctx.session.user.organization_id,
        },
        input.data,
        { new: true }
      );

      if (!channel) {
        throw new Error("Channel not found");
      }

      return channel;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const channel = await ChannelModel.findOneAndDelete({
        _id: input.id,
        organization_id: ctx.session.user.organization_id,
      });

      if (!channel) {
        throw new Error("Channel not found");
      }

      return { success: true };
    }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const channel = await ChannelModel.findOne({
      _id: input.id,
      organization_id: ctx.session.user.organization_id,
    });

    if (!channel) {
      throw new Error("Channel not found");
    }

    return channel;
  }),

  checkAccessCodeAvailability: protectedProcedure
    .input(z.object({ access_code: z.string() }))
    .query(async ({ ctx, input }) => {
      const existingChannel = await ChannelModel.findOne({
        access_code: input.access_code,
        organization_id: ctx.session.user.organization_id,
      });

      return { available: !existingChannel };
    }),

  generateUniqueIdentifiers: protectedProcedure.query(async ({ ctx }) => {
    let attempts = 0;
    const maxAttempts = 50;

    let accessCode: string;
    let isAccessCodeUnique = false;
    attempts = 0;

    do {
      accessCode = Array.from({ length: 8 }, () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return chars[Math.floor(Math.random() * chars.length)];
      }).join("");

      const existingAccessCode = await ChannelModel.findOne({
        access_code: accessCode,
        organization_id: ctx.session.user.organization_id,
      });

      isAccessCodeUnique = !existingAccessCode;
      attempts++;
    } while (!isAccessCodeUnique && attempts < maxAttempts);

    if (!isAccessCodeUnique) {
      throw new Error("Unable to generate unique access code after multiple attempts");
    }

    return {
      access_code: accessCode,
    };
  }),

  getOrgPublicKeyByAccessCode: publicProcedure
    .input(z.object({ accessCode: z.string() }))
    .query(async ({ input }) => {
      const channel = await ChannelModel.findOne({
        access_code: input.accessCode,
        is_active: true,
      }).populate("organization_id");

      if (!channel) {
        throw new Error("Invalid access code");
      }

      const organization = await OrganizationModel.findById(channel.organization_id);
      if (!organization || !organization.public_key) {
        throw new Error("Organization public key not found");
      }

      return {
        publicKey: organization.public_key,
      };
    }),
});

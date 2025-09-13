import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../context";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3";

export const uploadRouter = createTRPCRouter({
  getUploadUrl: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        caseId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const storageKey = `attachments/${input.caseId}/${timestamp}-${randomStr}-${input.fileName}`;

      const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
        Key: storageKey,
        ContentType: input.fileType,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 900,
        signableHeaders: new Set(["host"]),
      });

      return { url: signedUrl, storageKey };
    }),

  getDownloadUrl: publicProcedure
    .input(
      z.object({
        storageKey: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { storageKey } = input;

      const command = new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
        Key: storageKey,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 900,
        signableHeaders: new Set(["host"]),
      });

      return {
        url: signedUrl,
      };
    }),
});

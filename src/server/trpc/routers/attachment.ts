import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../context";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3";
import AttachmentModel from "@/models/attachment.model";

export const attachmentRouter = createTRPCRouter({
  getDownloadUrl: publicProcedure
    .input(
      z.object({
        attachmentId: z.string(),
        publicKey: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { attachmentId, publicKey } = input;

      const attachment = await AttachmentModel.findById(attachmentId).populate("case_id").lean();

      if (!attachment) {
        throw new Error("Attachment not found");
      }

      if (!attachment.iv) {
        throw new Error("Attachment IV not found - file cannot be decrypted");
      }

      const caseData = attachment.case_id as unknown as { anon_public_key: string };
      if (caseData.anon_public_key !== publicKey) {
        throw new Error("Unauthorized");
      }

      const command = new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
        Key: attachment.storage_key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 900,
        signableHeaders: new Set(["host"]),
      });

      return {
        url: signedUrl,
        fileName: attachment.file_name,
        mimeType: attachment.mime_type,
        iv: attachment.iv,
      };
    }),
});

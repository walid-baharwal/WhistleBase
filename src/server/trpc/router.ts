import { createTRPCRouter } from "./context";
import { authRouter } from "./routers/auth";
import { channelRouter } from "./routers/channel";
import { uploadRouter } from "./routers/upload";
import { caseRouter } from "./routers/case";
import { attachmentRouter } from "./routers/attachment";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  channel: channelRouter,
  upload: uploadRouter,
  case: caseRouter,
  attachment: attachmentRouter,
});

export type AppRouter = typeof appRouter; 
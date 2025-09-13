import { createTRPCRouter } from "./context";
import { authRouter } from "./routers/auth";
import { channelRouter } from "./routers/channel";
import { uploadRouter } from "./routers/upload";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  channel: channelRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter; 
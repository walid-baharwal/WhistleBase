import { createTRPCRouter } from "./context";
import { authRouter } from "./routers/auth";
import { channelRouter } from "./routers/channel";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  channel: channelRouter,
});

export type AppRouter = typeof appRouter; 
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const pinMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { assertPin } = await import("./pin.server");
    assertPin();
    return next();
  },
);

export const pinStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { pinUnlocked } = await import("./pin.server");
  return { unlocked: pinUnlocked() };
});

export const unlockFloor = createServerFn({ method: "POST" })
  .validator(z.object({ pin: z.string() }))
  .handler(async ({ data }) => {
    const { tryUnlock } = await import("./pin.server");
    if (!tryUnlock(data.pin)) throw new Error("Wrong PIN");
    return { unlocked: true as const };
  });

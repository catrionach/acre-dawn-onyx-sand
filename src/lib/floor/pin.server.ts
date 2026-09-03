import { createHash, timingSafeEqual } from "node:crypto";
import {
  getCookie,
  getRequestProtocol,
  setCookie,
} from "@tanstack/react-start/server";

const COOKIE = "ce_master";
const PIN = "1969";
const TOKEN = createHash("sha256").update(`ce-master:${PIN}`).digest("hex");

function same(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function pinUnlocked(): boolean {
  const value = getCookie(COOKIE);
  return Boolean(value && same(value, TOKEN));
}

export function assertPin(): void {
  if (!pinUnlocked()) {
    const err = new Error("PIN required");
    (err as { status?: number }).status = 401;
    throw err;
  }
}

export function tryUnlock(pin: string): boolean {
  if (!same(pin.trim(), PIN)) return false;
  setCookie(COOKIE, TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: getRequestProtocol() === "https",
    maxAge: 60 * 60 * 24 * 28,
  });
  return true;
}

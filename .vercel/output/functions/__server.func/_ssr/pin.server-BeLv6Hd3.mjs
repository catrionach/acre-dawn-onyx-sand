import { c as setCookie$1, o as getCookie, s as getRequestProtocol$1 } from "./ssr.mjs";
import { createHash, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/pin.server-BeLv6Hd3.js
var COOKIE = "ce_master";
var PIN = "1969";
var TOKEN = createHash("sha256").update(`ce-master:${PIN}`).digest("hex");
function same(a, b) {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	if (left.length !== right.length) return false;
	return timingSafeEqual(left, right);
}
function pinUnlocked() {
	const value = getCookie(COOKIE);
	return Boolean(value && same(value, TOKEN));
}
function assertPin() {
	if (!pinUnlocked()) {
		const err = /* @__PURE__ */ new Error("PIN required");
		err.status = 401;
		throw err;
	}
}
function tryUnlock(pin) {
	if (!same(pin.trim(), PIN)) return false;
	setCookie$1(COOKIE, TOKEN, {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		secure: getRequestProtocol$1() === "https",
		maxAge: 2419200
	});
	return true;
}
//#endregion
export { assertPin, pinUnlocked, tryUnlock };

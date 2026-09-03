import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { gn as string, pn as object } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pin-DSRiR0WJ.js
var pinStatus_createServerFn_handler = createServerRpc({
	id: "ad5fb5a4776025a660e7c94d5c83e0a8b103063b57a5ddda6667e54ae16e4f5a",
	name: "pinStatus",
	filename: "src/lib/floor/pin.ts"
}, (opts) => pinStatus.__executeServer(opts));
var pinStatus = createServerFn({ method: "GET" }).handler(pinStatus_createServerFn_handler, async () => {
	const { pinUnlocked } = await import("./pin.server-BeLv6Hd3.mjs");
	return { unlocked: pinUnlocked() };
});
var unlockFloor_createServerFn_handler = createServerRpc({
	id: "3afa1be5fc641d6425b9417d948ae052d869d388142643aec3efd8115464b857",
	name: "unlockFloor",
	filename: "src/lib/floor/pin.ts"
}, (opts) => unlockFloor.__executeServer(opts));
var unlockFloor = createServerFn({ method: "POST" }).validator(object({ pin: string() })).handler(unlockFloor_createServerFn_handler, async ({ data }) => {
	const { tryUnlock } = await import("./pin.server-BeLv6Hd3.mjs");
	if (!tryUnlock(data.pin)) throw new Error("Wrong PIN");
	return { unlocked: true };
});
//#endregion
export { pinStatus_createServerFn_handler, unlockFloor_createServerFn_handler };

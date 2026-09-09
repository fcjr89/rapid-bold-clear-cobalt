/**
 * Steamworks placeholder — no real AppID or native SDK required for scaffold.
 * Set STEAM_APP_ID (or STEAMWORKS_APP_ID) when you have a real Steam App ID.
 * Default 480 is Valve Spacewar test app id (documentation only).
 *
 * Later: swap this stub for steamworks.js / greenworks and call
 * SteamAPI_Init() after reading the app id from env / steam_appid.txt.
 */

function initSteamworksPlaceholder(opts) {
  opts = opts || {};
  const appId = String(opts.appId || process.env.STEAM_APP_ID || process.env.STEAMWORKS_APP_ID || "480");
  process.env.SteamAppId = appId;
  process.env.STEAM_APP_ID = appId;

  try {
    const fs = require("node:fs");
    const path = require("node:path");
    const { app } = require("electron");
    const dir = app.isPackaged ? path.dirname(process.execPath) : process.cwd();
    const target = path.join(dir, "steam_appid.txt");
    if (!fs.existsSync(target)) {
      fs.writeFileSync(target, appId + "\n", "utf8");
    }
  } catch (err) {
    console.warn("[steamworks-stub] could not write steam_appid.txt:", err.message);
  }

  console.log("[steamworks-stub] placeholder init — STEAM_APP_ID=" + appId + " (no native Steamworks loaded)");
  return { ok: true, appId: appId, stub: true };
}

module.exports = { initSteamworksPlaceholder };

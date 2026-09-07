/**
 * Preload bridge for THE CULTURE WAR desktop shell.
 * Exposes fullscreen helpers + Steam env stub; gamepad is handled in-page
 * via the Gamepad API (see docs/STEAM.md).
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cultureWarSteam", {
  getEnv: () => ipcRenderer.invoke("steam:get-env"),
  setFullscreen: (value) => ipcRenderer.invoke("steam:set-fullscreen", value),
  toggleFullscreen: () => ipcRenderer.invoke("steam:toggle-fullscreen"),
});

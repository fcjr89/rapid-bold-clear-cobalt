const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cultureWarDesktop", {
  toggleFullscreen: () => ipcRenderer.invoke("culture-war:toggle-fullscreen"),
  platform: () => ipcRenderer.invoke("culture-war:platform"),
});

/**
 * THE CULTURE WAR — Steam / desktop shell.
 */
const { app, BrowserWindow, globalShortcut, ipcMain, shell } = require("electron");
const path = require("node:path");
const { startDistServer, resolveDistDir } = require("./serve-dist.cjs");
const { initSteamworksPlaceholder } = require("./steamworks-stub.cjs");

let mainWindow = null;
let distServer = null;

const borderless = process.env.STEAM_BORDERLESS === "1";
const startFullscreen = process.env.STEAM_FULLSCREEN === "1";

function createWindow(loadUrl) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    title: "THE CULTURE WAR",
    backgroundColor: "#0c0814",
    autoHideMenuBar: true,
    frame: !borderless,
    fullscreen: startFullscreen,
    fullscreenable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.loadURL(loadUrl);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.on("closed", () => { mainWindow = null; });
}

function registerShortcuts() {
  globalShortcut.register("F11", () => {
    if (!mainWindow) return;
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });
  globalShortcut.register("Alt+Enter", () => {
    if (!mainWindow) return;
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });
}

ipcMain.handle("steam:get-env", () => ({
  appId: process.env.STEAM_APP_ID || process.env.STEAMWORKS_APP_ID || "",
  borderless,
  fullscreen: Boolean(mainWindow && mainWindow.isFullScreen()),
  platform: process.platform,
}));

ipcMain.handle("steam:set-fullscreen", (_e, value) => {
  if (!mainWindow) return false;
  mainWindow.setFullScreen(Boolean(value));
  return mainWindow.isFullScreen();
});

ipcMain.handle("steam:toggle-fullscreen", () => {
  if (!mainWindow) return false;
  mainWindow.setFullScreen(!mainWindow.isFullScreen());
  return mainWindow.isFullScreen();
});

app.whenReady().then(async () => {
  initSteamworksPlaceholder({
    appId: process.env.STEAM_APP_ID || process.env.STEAMWORKS_APP_ID || "480",
  });

  const distDir = resolveDistDir(path.join(__dirname, ".."));
  if (!distDir) {
    console.error("[steam] No Vite dist found. Run the desktop build script first (expected dist/client, dist, or .output/public).");
    app.exit(1);
    return;
  }

  distServer = await startDistServer(distDir);
  const url = "http://127.0.0.1:" + distServer.port + "/";
  console.log("[steam] Serving " + distDir + " at " + url);
  createWindow(url);
  registerShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(url);
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  if (distServer) distServer.close();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

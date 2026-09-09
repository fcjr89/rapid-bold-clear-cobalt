const path = require("path");
const fs = require("fs");
const __desk = "elec" + "tron";
const { app, BrowserWindow, globalShortcut, shell, ipcMain } = require(__desk);
const DEV_URL = process.env.CULTURE_WAR_URL || "http://127.0.0.1:8080";
const isDev = process.argv.includes("--dev") || !app.isPackaged;
function resolveStaticIndex() {
  const flag = process.argv.find((a) => a.startsWith("--static="));
  if (flag) return path.join(flag.slice(9), "index.html");
  if (process.env.CULTURE_WAR_STATIC) return path.join(process.env.CULTURE_WAR_STATIC, "index.html");
  const packed = path.join(process.resourcesPath || "", "game", "index.html");
  return fs.existsSync(packed) ? packed : null;
}
let mainWindow = null;
let isFullscreen = false;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 720, minWidth: 960, minHeight: 540,
    backgroundColor: "#0c0814",
    title: "THE CULTURE WAR — Bloodlines of the Divide",
    autoHideMenuBar: true, fullscreenable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      backgroundThrottling: false,
    },
  });
  const staticIndex = !isDev ? resolveStaticIndex() : null;
  if (staticIndex && fs.existsSync(staticIndex)) mainWindow.loadFile(staticIndex);
  else mainWindow.loadURL(DEV_URL);
}
function toggleFullscreen() {
  if (!mainWindow) return;
  isFullscreen = !isFullscreen;
  mainWindow.setFullScreen(isFullscreen);
}
app.whenReady().then(() => {
  createWindow();
  globalShortcut.register("F11", toggleFullscreen);
  ipcMain.handle("culture-war:toggle-fullscreen", () => { toggleFullscreen(); return isFullscreen; });
  ipcMain.handle("culture-war:platform", () => ({ steam: true, packaged: app.isPackaged, version: app.getVersion() }));
});
app.on("will-quit", () => globalShortcut.unregisterAll());
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

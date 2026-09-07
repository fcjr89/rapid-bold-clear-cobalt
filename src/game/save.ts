import { applySave, G, SAVE_VERSION, snapshot } from "./state";
import type { SaveBlob } from "./types";

const KEY = "baki-hammer-save-v1";
const BACKUP = "baki-hammer-save-bak";

export function hasSave(): boolean {
  try {
    return Boolean(localStorage.getItem(KEY));
  } catch {
    return false;
  }
}

export function loadSave(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as SaveBlob;
    if (!parsed || typeof parsed !== "object") return false;
    if (parsed.version !== SAVE_VERSION) {
      parsed.version = SAVE_VERSION;
    }
    applySave(parsed);
    return true;
  } catch {
    return false;
  }
}

export function writeSave(): boolean {
  try {
    const blob = JSON.stringify(snapshot());
    const prev = localStorage.getItem(KEY);
    if (prev) localStorage.setItem(BACKUP, prev);
    localStorage.setItem(KEY, blob);
    return true;
  } catch {
    return false;
  }
}

export function bindAutosave(): void {
  const flush = () => {
    if (G.hero.hp > 0) writeSave();
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);
}

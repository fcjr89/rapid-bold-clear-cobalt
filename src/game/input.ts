/** Unified held-key input. Touch buttons + Gamepad inject the same codes. */

const held = new Set<string>();
const injected = new Set<string>();
let confirmPulse = false;
let cancelPulse = false;
let menuPulse = false;

/** Last-frame pressed flags for edge detection (avoid auto-fire). */
const padPrev = new Map<string, boolean>();

const CONFIRM = new Set(["KeyZ", "Space", "Enter", "KeyJ"]);
const CANCEL = new Set(["KeyX", "Escape", "KeyK", "Backspace"]);

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function bindInput(): () => void {
  const down = (e: KeyboardEvent) => {
    if (isTypingTarget(e.target)) return;
    held.add(e.code);
    if (CONFIRM.has(e.code) || CANCEL.has(e.code) || e.code.startsWith("Arrow") || e.code.startsWith("Key")) {
      e.preventDefault();
    }
    if (CONFIRM.has(e.code)) confirmPulse = true;
    if (CANCEL.has(e.code)) cancelPulse = true;
  };
  const up = (e: KeyboardEvent) => {
    held.delete(e.code);
  };
  const clear = () => held.clear();
  window.addEventListener("keydown", down, { passive: false });
  window.addEventListener("keyup", up);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });
  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    window.removeEventListener("blur", clear);
  };
}

export function setInjected(codes: string[], down: boolean) {
  for (const c of codes) {
    if (down) {
      injected.add(c);
      if (CONFIRM.has(c)) confirmPulse = true;
      if (CANCEL.has(c)) cancelPulse = true;
    } else injected.delete(c);
  }
}

export function setKeysExact(codes: string[]) {
  injected.clear();
  for (const c of codes) injected.add(c);
}

export function isDown(code: string): boolean {
  return held.has(code) || injected.has(code);
}

function padEdge(id: string, pressed: boolean): boolean {
  const was = padPrev.get(id) ?? false;
  padPrev.set(id, pressed);
  return pressed && !was;
}

export function axis(): { x: number; y: number } {
  let x = 0;
  let y = 0;
  if (isDown("KeyA") || isDown("ArrowLeft")) x -= 1;
  if (isDown("KeyD") || isDown("ArrowRight")) x += 1;
  if (isDown("KeyW") || isDown("ArrowUp")) y -= 1;
  if (isDown("KeyS") || isDown("ArrowDown")) y += 1;
  try {
    const pads = navigator.getGamepads?.() ?? [];
    for (const pad of pads) {
      if (!pad) continue;
      const lx = pad.axes[0] ?? 0;
      const ly = pad.axes[1] ?? 0;
      if (lx < -0.35 || pad.buttons[14]?.pressed) x -= 1;
      if (lx > 0.35 || pad.buttons[15]?.pressed) x += 1;
      if (ly < -0.35 || pad.buttons[12]?.pressed) y -= 1;
      if (ly > 0.35 || pad.buttons[13]?.pressed) y += 1;
      if (padEdge(`${pad.index}:a`, Boolean(pad.buttons[0]?.pressed))) confirmPulse = true;
      if (padEdge(`${pad.index}:b`, Boolean(pad.buttons[1]?.pressed))) cancelPulse = true;
      if (padEdge(`${pad.index}:start`, Boolean(pad.buttons[9]?.pressed))) menuPulse = true;
      if (padEdge(`${pad.index}:x`, Boolean(pad.buttons[2]?.pressed))) confirmPulse = true;
    }
  } catch {
    /* ignore */
  }
  return { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
}

export function consumeConfirm(): boolean {
  if (confirmPulse) {
    confirmPulse = false;
    return true;
  }
  return false;
}

export function consumeCancel(): boolean {
  if (cancelPulse) {
    cancelPulse = false;
    return true;
  }
  return false;
}

/** Start / menu button edge (Steam Deck / Xbox Menu). */
export function consumeMenu(): boolean {
  if (menuPulse) {
    menuPulse = false;
    return true;
  }
  return false;
}

export function pulseConfirm() {
  confirmPulse = true;
}
export function pulseCancel() {
  cancelPulse = true;
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      getX: () => number;
      getY: () => number;
      setKeys: (codes: string[]) => void;
      setSteer?: (v: number) => void;
    };
    __baki?: { map: string; hp: number };
    __phaserGame?: { scene: { getScenes: (active?: boolean) => { sys: { settings: { key: string } }[] } } };
    cultureWarSteam?: {
      getEnv: () => Promise<{ appId: string; borderless: boolean; fullscreen: boolean; platform: string }>;
      setFullscreen: (v: boolean) => Promise<boolean>;
      toggleFullscreen: () => Promise<boolean>;
    };
  }
}

let ctx: AudioContext | null = null;
let musicTimer: number | null = null;
let musicName: string | null = null;
let muted = false;
let trackEl: HTMLAudioElement | null = null;

/** TWILIGHT ZONE TIME (NA404ERROR) — masters under public/game/music/ */
const TRACKS: Record<string, string> = {
  title: "/game/music/shadow-empires.mp3",
  overworld: "/game/music/shadow-empires.mp3",
  intro: "/game/music/black-veil.mp3",
  dungeon: "/game/music/subterranean-syndicate.mp3",
  tavern: "/game/music/black-veil.mp3",
  battle: "/game/music/burn-the-matrix.mp3",
  boss: "/game/music/globalist-guillotine.mp3",
  final: "/game/music/killuminati.mp3",
  red: "/game/music/chemtrails-fluoride.mp3",
  blue: "/game/music/mk-veil.mp3",
};

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  return ctx;
}

export function unlockAudio(): void {
  const c = ac();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
}

function tone(freq: number, dur: number, type: OscillatorType, gain = 0.05, at = 0) {
  const c = ac();
  if (!c || muted) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function sfx(kind: "ok" | "no" | "hit" | "crit" | "heal" | "win" | "lose" | "step" | "menu") {
  unlockAudio();
  if (kind === "ok" || kind === "menu") tone(520, 0.07, "square", 0.04);
  if (kind === "no") tone(180, 0.12, "square", 0.05);
  if (kind === "hit") {
    tone(140, 0.1, "sawtooth", 0.06);
    tone(90, 0.14, "square", 0.04, 0.02);
  }
  if (kind === "crit") {
    tone(220, 0.08, "sawtooth", 0.07);
    tone(440, 0.1, "square", 0.05, 0.06);
  }
  if (kind === "heal") {
    tone(392, 0.1, "triangle", 0.05);
    tone(523, 0.12, "triangle", 0.04, 0.08);
  }
  if (kind === "win") {
    [392, 494, 587, 784].forEach((f, i) => tone(f, 0.12, "square", 0.05, i * 0.09));
  }
  if (kind === "lose") {
    [220, 196, 164, 110].forEach((f, i) => tone(f, 0.16, "sawtooth", 0.05, i * 0.1));
  }
  if (kind === "step") tone(90, 0.03, "square", 0.02);
}

/** Procedural fallback if an MP3 fails to load. */
const THEMES: Record<string, number[]> = {
  overworld: [196, 220, 262, 196, 233, 262, 294, 220],
  dungeon: [155, 147, 130, 155, 110, 98, 130, 147],
  tavern: [262, 294, 330, 392, 330, 294, 262, 196],
  battle: [247, 196, 185, 247, 311, 196, 165, 247],
  boss: [110, 130, 110, 98, 146, 110, 82, 98],
  title: [196, 247, 294, 392, 294, 247, 220, 196],
  intro: [185, 196, 220, 196, 165, 147, 130, 110],
  final: [98, 110, 130, 98, 82, 73, 98, 110],
  red: [220, 196, 185, 165, 196, 220, 247, 196],
  blue: [262, 294, 311, 262, 233, 220, 196, 233],
};

export type MusicCue = keyof typeof TRACKS | "none";

function stopTrack() {
  if (trackEl) {
    trackEl.pause();
    trackEl.src = "";
    trackEl = null;
  }
}

function playProcedural(name: string) {
  const notes = THEMES[name] ?? THEMES.title!;
  let i = 0;
  const tick = () => {
    const n = notes[i % notes.length]!;
    const harsh = name === "battle" || name === "boss" || name === "final";
    tone(n, 0.18, harsh ? "sawtooth" : "square", 0.028);
    tone(n / 2, 0.18, "triangle", 0.016);
    i += 1;
  };
  tick();
  musicTimer = window.setInterval(tick, harshInterval(name));
}

function harshInterval(name: string): number {
  return name === "battle" || name === "boss" || name === "final" ? 220 : 320;
}

export function playMusic(name: MusicCue) {
  unlockAudio();
  if (name === musicName) return;
  stopMusic();
  if (name === "none") return;
  musicName = name;
  if (muted) return;

  const url = TRACKS[name];
  if (url && typeof Audio !== "undefined") {
    const el = new Audio(url);
    el.loop = true;
    el.volume = 0.55;
    trackEl = el;
    void el.play().catch(() => {
      stopTrack();
      playProcedural(name);
    });
    return;
  }
  playProcedural(name);
}

export function stopMusic() {
  if (musicTimer != null) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
  stopTrack();
  musicName = null;
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(v: boolean) {
  muted = v;
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem("tcw-mute", v ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (v) {
    // Keep musicName so unmute can resume the same cue.
    if (musicTimer != null) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
    stopTrack();
  } else if (musicName && musicName !== "none") {
    const resume = musicName as MusicCue;
    musicName = null;
    playMusic(resume);
  }
}

/** Load mute preference once at boot (call from BootScene). */
export function loadMutePreference() {
  try {
    if (typeof localStorage !== "undefined" && localStorage.getItem("tcw-mute") === "1") muted = true;
  } catch {
    /* ignore */
  }
}

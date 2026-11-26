// Sound-effect hooks. Each event below is mapped to a file in public/sfx/. Set a path to "" to silence that event.
//
// 1. Drop your audio files into public/sfx/ (short .mp3 / .ogg / .wav).
// 2. Put the path next to the event name, for example:  "cursor-link-in": "/sfx/glass-in.mp3"
// 3. Done. The cursor, buttons and page transitions already call sfx("<event>") at the right moments.
//
// Browsers only allow audio after the first click or key press, so the first sound plays after that.
// Visitors who prefer reduced motion get no sound. Call setSfxMuted(true) from a mute button if you add one.
export const SFX = {
  // custom cursor
  "cursor-link-in": "",                      // hover: intentionally silent
  "cursor-press": "/sfx/pop-click.mp3",      // mouse down
  "cursor-release": "",                      // mouse up (left silent: hover + press already give feedback)
  // page
  "page-curtain": "/sfx/whoosh-transition.mp3", // the curtain wipe between pages
  "nav-lens": "/sfx/transition-soft.mp3",       // the glass lens in the header jumps to a new section
  "figure-reveal": "/sfx/transition-soft.mp3",  // a photograph opens on a place page
  // sections
  "food-dish": "",                           // intentionally silent
  "guide-send": "/sfx/ai-chat.mp3",          // you send a question to the guide
  "guide-reply": "/sfx/ding-info.mp3",       // the guide has finished answering
  "footer-reveal": "/sfx/footer-logo.mp3",   // the Udupi wordmark rises out of the sea
};

const VOL = { "cursor-press": 0.35, "cursor-release": 0.25, "nav-lens": 0.25, "page-curtain": 0.4, "guide-reply": 0.35, "footer-reveal": 0.5 };
const cache = {}; let muted = false, unlocked = false, last = {};
export const setSfxMuted = (m) => { muted = !!m; };
if (typeof window !== "undefined") {
  const unlock = () => { unlocked = true; removeEventListener("pointerdown", unlock); removeEventListener("keydown", unlock); };
  addEventListener("pointerdown", unlock, { once: false }); addEventListener("keydown", unlock);
}
export function sfx(name) {
  if (muted || !unlocked || typeof Audio === "undefined") return false;
  const src = SFX[name]; if (!src) return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const now = performance.now(); if (now - (last[name] || 0) < 60) return false; last[name] = now; // no machine-gun repeats
  const a = (cache[name] ||= new Audio(src)).cloneNode(); a.volume = VOL[name] ?? 0.4; a.play().catch(() => {});
  return true;
}
// Plays a sound once per key for the whole visit. The key is only spent when the sound really played, so a visitor who has not clicked yet
// (browsers block audio until then) still hears it the first time it can play. Scrolling back and forth never repeats it.
const spent = new Set();
export function sfxOnce(name, key = name) { if (spent.has(key)) return; if (sfx(name)) spent.add(key); }

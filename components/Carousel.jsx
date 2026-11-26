"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
// Ported from the Bencho "Carousel" block (TSX to JSX). Cards sit on a ring that drifts at rest, sinks under the
// pointer and can be thrown. Nothing ever leaves the frame, so it is endless: `turn` is never clamped or wrapped.
// Three motions on three nested elements, one transform each: slot (ring), float (drift), card (tilt).

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const mix = (a, b, t) => a + (b - a) * t;
const mod = (n, m) => ((n % m) + m) % m;
const rate = (speed) => 1.6 - (speed / 100) * 1.2;
const out = (t) => 1 - (1 - t) ** 4;
const stillness = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* spring chosen by damping ratio: 0 is heavy and arrives without a ring, 50 is the tuned default, 100 is lively */
const springOf = (tune) => ({ k: 0.08 + (tune / 100) * 0.16, d: 0.62 + (tune / 100) * 0.2 });
function useSpring(target, tune = 50, instant = false) {
  const [at, setAt] = useState(target), cur = useRef(target), vel = useRef(0), raf = useRef(0);
  useEffect(() => {
    if (instant) { cur.current = target; vel.current = 0; setAt(target); return; }
    const { k, d } = springOf(tune); let prev = 0;
    const tick = (t) => {
      const dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1; prev = t;
      vel.current += (target - cur.current) * k * dt; vel.current *= Math.pow(d, dt); cur.current += vel.current * dt;
      if (Math.abs(target - cur.current) < 0.02 && Math.abs(vel.current) < 0.02) { cur.current = target; vel.current = 0; setAt(target); raf.current = 0; return; }
      setAt(cur.current); raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf.current); raf.current = 0; };
  }, [target, tune, instant]);
  return at;
}

const CARD_W = 206, CARD_H = 292, STAGE_H = 340, ORBIT = 138, DEPTH = 100, DEPTH_MAX = 150, CORNER = 20, FLOAT = 15, SINK = 50, SETTLE = 50;
const LEAN = 38, PULL = 140, TOSS = 150, MOST = 2, BASE = 620;
const ANGLE = [-4.2, 2.6, -1.4, 3.8, 1.7, -3.1, 0.9, -2.2, 4.4, -0.6, 2.9, -3.6];
const PERIOD = [4.7, 5.9, 6.7, 5.3, 7.1, 6.1, 5.5, 6.3, 4.9, 7.3, 5.1, 6.9];

/* The tuned ring is 5 cards at orbit 138. With more cards the orbit grows so neighbours fan out by the same
   distance at the front, and the frame widens with it. */
export const ringOf = (n) => { const orbit = n <= 5 ? ORBIT : clamp(131 / Math.sin((Math.PI * 2) / n), ORBIT, 300); return { orbit, w: Math.round(orbit * 2 + 200) }; };
export const STAGE = STAGE_H;

const spotOf = (i, turn, orbit, depth, n) => {
  const th = (i - turn) * ((Math.PI * 2) / n), f = (Math.cos(th) + 1) / 2;
  return { x: Math.sin(th) * orbit, y: -(1 - f) * LEAN, s: mix(1 - clamp(depth, 0, DEPTH_MAX) / 200, 1, f), z: Math.round(f * 100) };
};
const write = (el, sp, angle) => { el.style.transform = `translate(-50%, -50%) translate(${sp.x.toFixed(2)}px, ${sp.y.toFixed(2)}px) rotate(${angle}deg) scale(${sp.s.toFixed(4)})`; el.style.zIndex = String(sp.z); };

export default function Carousel({ shots, scale = 1, orbit: orbitProp, depth = DEPTH, corner = CORNER, float = FLOAT, sink = SINK, settle = SETTLE, spin = 0, apiRef, onFront, onOpen }) {
  const n = shots.length, { orbit: o, w } = ringOf(n), orbit = orbitProp ?? o, still = stillness();
  const slots = useRef([]), turn = useRef(0), raf = useRef(0), drag = useRef(null), lastFront = useRef(-1), [held, setHeld] = useState(false);
  slots.current.length = n;

  const paint = useCallback(() => {
    slots.current.forEach((el, i) => el && write(el, spotOf(i, turn.current, orbit, depth, n), ANGLE[i % ANGLE.length]));
    const fi = mod(Math.round(turn.current), n);
    if (fi !== lastFront.current) { lastFront.current = fi; onFront?.(fi); }
  }, [orbit, depth, n, onFront]);
  useLayoutEffect(paint, [paint]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  useEffect(() => {
    if (!spin || still || held) return;
    let id = 0, prev = 0;
    const step = (t) => { if (prev) turn.current += ((t - prev) / 1000) * (n / spin); prev = t; paint(); id = requestAnimationFrame(step); };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [spin, still, held, paint, n]);

  const glide = (to) => {
    cancelAnimationFrame(raf.current);
    const from = turn.current;
    if (still || from === to) { turn.current = to; paint(); return; }
    const ms = BASE * rate(clamp(settle, 0, 100)), t0 = performance.now();
    const tick = (now) => { const p = Math.min(1, (now - t0) / ms); turn.current = mix(from, to, out(p)); paint(); if (p < 1) raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
  };
  const go = (d) => glide(Math.round(turn.current) + d);
  useEffect(() => { if (apiRef) apiRef.current = { go }; });

  const down = (e) => {
    cancelAnimationFrame(raf.current);
    const s = e.target.closest?.(".car-slot");
    drag.current = { x0: e.clientX, t0: turn.current, last: e.clientX, t: e.timeStamp, vx: 0, moved: false, idx: s ? +s.dataset.i : null };
    setHeld(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const move = (e) => {
    const g = drag.current; if (!g) return;
    const dx = e.clientX - g.x0;
    if (!g.moved && Math.abs(dx) > 3) g.moved = true;
    const dt = Math.max(1, e.timeStamp - g.t);
    g.vx = (g.vx + (e.clientX - g.last) / dt) / 2; g.last = e.clientX; g.t = e.timeStamp;
    turn.current = g.t0 - dx / (PULL * scale);
    paint();
  };
  const up = () => {
    const g = drag.current; if (!g) return;
    drag.current = null; setHeld(false);
    if (!g.moved && g.idx != null) { /* a tap: bring that card forward, or open the one already in front */
      const front = mod(Math.round(turn.current), n);
      if (g.idx === front) { onOpen?.(front); return; }
      let d = g.idx - front; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
      glide(Math.round(turn.current) + d); return;
    }
    const carry = clamp((-g.vx * TOSS) / (PULL * scale), -MOST, MOST);
    glide(Math.round(turn.current + carry));
  };
  const key = (e) => {
    if (e.key === "Enter") { e.preventDefault(); onOpen?.(mod(Math.round(turn.current), n)); return; }
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return; e.preventDefault(); go(d);
  };
  const r = clamp(corner, 0, 40);

  return (
    <div className="car" style={{ width: w, height: STAGE_H }}>
      <div className="car-track" data-held={held} role="group" aria-label="Photo carousel. Arrow keys turn it, Enter opens the front photo" aria-roledescription="carousel" tabIndex={0} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {shots.map((shot, i) => (
          <div key={shot.name} data-i={i} ref={(el) => { slots.current[i] = el; }} className="car-slot" style={{ width: CARD_W, height: CARD_H }}>
            <div className="car-float" style={{ animationName: float <= 0 ? "none" : undefined, animationDuration: `${PERIOD[i % PERIOD.length]}s`, "--lift": `${((clamp(float, 0, 100) / 100) * 16).toFixed(2)}px`, "--sway": `${((clamp(float, 0, 100) / 100) * 1.4).toFixed(2)}deg` }}>
              <Card shot={shot} corner={r} sink={sink} off={held || still} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ shot, corner, sink, off }) {
  const skin = useRef(null), [pt, setPt] = useState({ x: 0, y: 0 }), [on, setOn] = useState(false), still = stillness();
  const live = on && !off;
  const sx = useSpring(live ? pt.x : 0, 50, still), sy = useSpring(live ? pt.y : 0, 50, still), lit = useSpring(live ? 1 : 0, 50, still);
  const deep = clamp(sink, 0, 100) / 100, max = deep * 13;
  /* it sinks, it does not lift: the point under the pointer goes away */
  const rx = -sy * max, ry = sx * max, px = ((sx + 1) / 2) * 100, py = ((sy + 1) / 2) * 100, dark = deep * 0.5 * lit, rim = deep * 0.16 * lit;
  const track = (e) => { const el = skin.current; if (!el) return; const b = el.getBoundingClientRect(); setPt({ x: clamp(((e.clientX - b.left) / b.width) * 2 - 1, -1, 1), y: clamp(((e.clientY - b.top) / b.height) * 2 - 1, -1, 1) }); setOn(true); };
  return (
    <div ref={skin} className="car-card" onPointerMove={track} onPointerOut={(e) => { const el = skin.current, to = e.relatedTarget; if (!el || !to || !el.contains(to)) setOn(false); }} onPointerCancel={() => setOn(false)}
      style={{ borderRadius: corner, backgroundImage: `url(${shot.src})`, backgroundPosition: shot.pos || "center", transform: `translateZ(${(-10 * deep * lit).toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`, boxShadow: "0 12px 28px -10px rgba(var(--shadow-rgb), 0.28)" }}>
      <span className="car-sheen" aria-hidden="true" style={{ borderRadius: corner, backgroundImage: `radial-gradient(44% 36% at ${px.toFixed(1)}% ${py.toFixed(1)}%, rgba(9, 14, 28, ${dark.toFixed(3)}) 0%, rgba(9, 14, 28, 0) 100%), radial-gradient(54% 44% at ${(100 - px).toFixed(1)}% ${(100 - py).toFixed(1)}%, rgba(255, 255, 255, ${rim.toFixed(3)}) 0%, rgba(255, 255, 255, 0) 100%)` }} />
    </div>
  );
}

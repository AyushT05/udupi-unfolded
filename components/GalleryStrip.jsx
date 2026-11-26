"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

if (typeof window !== "undefined") gsap.registerPlugin(Draggable);

/* One strip, three effects:
   1. Marquee: drifts left on its own, can be dragged and thrown, loops with no seam (ported from the Obsidian DraggableMarquee).
   2. Parallax: each photo sits in a wider box than its card and slides against the motion (from the Obsidian ParallaxSlider).
   3. Hover: the card sinks under the pointer, with a dark spot and a faint rim light (the old ring's Card, unchanged). */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const stillness = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* marquee feel: same numbers as the pasted DraggableMarquee */
const THROW_MULTIPLIER = 2.8, THROW_FRICTION = 0.975, MAX_THROW = 60, SAMPLE = 36.67;
/* parallax: how far a photo drifts per px of distance from the strip centre. ROOM must match .gs-img (left:-30%; width:160%) */
const PARALLAX = 0.16, ROOM = 0.29;

/* spring chosen by damping ratio (unchanged from the ring carousel) */
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

/* The hover card. Tilt and sheen live on the button; the photo inside it is moved separately by the strip (parallax). */
function Card({ shot, dup, dragMoved, onOpen, corner = 20, sink = 50 }) {
  const skin = useRef(null), [pt, setPt] = useState({ x: 0, y: 0 }), [on, setOn] = useState(false), still = stillness();
  const sx = useSpring(on ? pt.x : 0, 50, still), sy = useSpring(on ? pt.y : 0, 50, still), lit = useSpring(on ? 1 : 0, 50, still);
  const deep = clamp(sink, 0, 100) / 100, max = deep * 13;
  /* it sinks, it does not lift: the point under the pointer goes away */
  const rx = -sy * max, ry = sx * max, px = ((sx + 1) / 2) * 100, py = ((sy + 1) / 2) * 100, dark = deep * 0.5 * lit, rim = deep * 0.16 * lit;
  /* a pressed button means a drag or a tap, so the hover effect stands down */
  const track = (e) => {
    const el = skin.current; if (!el) return;
    if (e.buttons) { setOn(false); return; }
    const b = el.getBoundingClientRect();
    setPt({ x: clamp(((e.clientX - b.left) / b.width) * 2 - 1, -1, 1), y: clamp(((e.clientY - b.top) / b.height) * 2 - 1, -1, 1) }); setOn(true);
  };
  return (
    <button ref={skin} type="button" className="gs-card" tabIndex={dup ? -1 : undefined} aria-label={`Open photo: ${shot.alt}`}
      onClick={(e) => { if (e.detail !== 0 && dragMoved.current) return; onOpen(); }}
      onPointerDown={() => setOn(false)} onPointerMove={track}
      onPointerOut={(e) => { const el = skin.current, to = e.relatedTarget; if (!el || !to || !el.contains(to)) setOn(false); }} onPointerCancel={() => setOn(false)}
      style={{ borderRadius: corner, transform: `translateZ(${(-10 * deep * lit).toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`, boxShadow: "0 12px 28px -10px rgba(var(--shadow-rgb), 0.28)" }}>
      <img className="gs-img" src={shot.src} alt="" draggable={false} decoding="async" style={{ objectPosition: shot.pos || "center" }} />
      <span className="gs-sheen" aria-hidden="true" style={{ borderRadius: corner, backgroundImage: `radial-gradient(44% 36% at ${px.toFixed(1)}% ${py.toFixed(1)}%, rgba(9, 14, 28, ${dark.toFixed(3)}) 0%, rgba(9, 14, 28, 0) 100%), radial-gradient(54% 44% at ${(100 - px).toFixed(1)}% ${(100 - py).toFixed(1)}%, rgba(255, 255, 255, ${rim.toFixed(3)}) 0%, rgba(255, 255, 255, 0) 100%)` }} />
    </button>
  );
}

export default function GalleryStrip({ shots, speed = 1, pauseOnHover = true, paused = false, apiRef, onOpen }) {
  const n = shots.length;
  const [copies, setCopies] = useState(2);
  const rootRef = useRef(null), trackRef = useRef(null), dragMoved = useRef(false), pausedRef = useRef(paused), place = useRef(0);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  /* The set is repeated so the loop has no seam. Only the first set is readable and focusable. */
  const items = useMemo(() => Array.from({ length: copies }).flatMap((_, c) => shots.map((shot, i) => ({ shot, i, c }))), [shots, copies]);

  useEffect(() => {
    const root = rootRef.current, track = trackRef.current;
    if (!root || !track || !n) return;
    const slots = Array.from(track.children), imgs = slots.map((s) => s.querySelector(".gs-img"));
    let impulse = null;
    const media = gsap.matchMedia();

    /* Prev / Next: a nudge in the marquee, or a plain scroll when reduced motion makes the strip a scroller */
    const pitch = () => (slots[1] ? slots[1].offsetLeft - slots[0].offsetLeft : root.clientWidth);
    if (apiRef) apiRef.current = { go: (d) => (impulse ? impulse(d) : root.scrollBy({ left: d * pitch(), behavior: "smooth" })) };

    media.add("(prefers-reduced-motion: no-preference)", () => {
      let period = 0, slotW = 0, x = 0, vel = 0, cruise = speed, wrapX = (v) => v;
      let centers = [], dragging = false, over = false, focused = false, visible = true, lastDragX = 0, lastT = 0, pressX = 0, releaseTimer = 0, resizeRaf = 0;
      const setX = gsap.quickSetter(track, "x", "px");
      const width = () => root.clientWidth;

      /* every photo drifts against the motion, in proportion to its distance from the centre of the strip */
      const paintImages = () => {
        const half = width() / 2, reach = half + slotW + 80, room = slotW * ROOM;
        for (let k = 0; k < imgs.length; k++) {
          const d = x + centers[k] - half;
          if (d > reach || d < -reach || !imgs[k]) continue;
          imgs[k].style.transform = `translate3d(${clamp(-d * PARALLAX, -room, room).toFixed(1)}px,0,0)`;
        }
      };
      const paint = () => { x = wrapX(x); setX(x); paintImages(); };

      const measure = () => {
        if (!slots[n]) return;
        const was = period;
        period = slots[n].offsetLeft - slots[0].offsetLeft; /* one full set, gaps included, so the wrap is exact */
        slotW = slots[0].offsetWidth;
        if (!period) return;
        centers = slots.map((s) => s.offsetLeft + s.offsetWidth / 2);
        wrapX = gsap.utils.wrap(-period, 0);
        x = was ? (x / was) * period : place.current * period;
        paint();
        const need = Math.max(2, Math.ceil((width() + (period - slotW)) / period) + 1);
        if (need > copies) setCopies(need);
      };
      const scheduleMeasure = () => { cancelAnimationFrame(resizeRaf); resizeRaf = requestAnimationFrame(measure); };

      const update = (_t, deltaTime) => {
        if (!visible || !period) return;
        const dt = clamp(deltaTime / 16.667, 0.5, 3);
        if (!dragging) {
          const goal = pausedRef.current || focused || (pauseOnHover && over) ? 0 : speed;
          cruise += (goal - cruise) * Math.min(1, 0.08 * dt); /* eases to a stop and back, never snaps */
          x -= cruise * dt;
          x += vel * dt;
          vel *= Math.pow(THROW_FRICTION, dt);
          if (Math.abs(vel) < 0.01) vel = 0;
        }
        paint();
      };

      impulse = (d) => { vel = -d * pitch() * (1 - THROW_FRICTION); }; /* travels one card, with the same friction as a throw */

      measure();

      const drag = Draggable.create(track, {
        type: "x",
        allowContextMenu: true,
        dragClickables: true,
        onPress() {
          dragging = true; vel = 0; dragMoved.current = false; clearTimeout(releaseTimer);
          pressX = this.pointerX; lastDragX = this.x; lastT = performance.now();
          root.dataset.dragging = "true";
        },
        onDrag() {
          const now = performance.now(), dx = this.x - lastDragX, dt = now - lastT;
          if (Math.abs(this.pointerX - pressX) > 6) dragMoved.current = true;
          x = this.x; paint(); /* paint wraps x, Draggable keeps counting from its own unwrapped value */
          if (dt > 0) vel = clamp((dx / dt) * SAMPLE * THROW_MULTIPLIER, -MAX_THROW, MAX_THROW);
          lastDragX = this.x; lastT = now;
        },
        onRelease() {
          dragging = false;
          root.dataset.dragging = "false";
          if (performance.now() - lastT > 100) vel = 0; /* held still before letting go: no throw */
          releaseTimer = window.setTimeout(() => { dragMoved.current = false; }, 60);
        },
      })[0];

      const onEnter = (e) => { if (e.pointerType === "mouse") over = true; };
      const onLeave = () => { over = false; };
      const onKeyDown = (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault(); impulse(e.key === "ArrowRight" ? 1 : -1);
      };
      /* tabbing to a photo brings it into view and holds the strip still while it has focus */
      const onFocusIn = (e) => {
        root.scrollLeft = 0;
        const t = e.target, k = slots.indexOf(t.closest?.(".gs-slot"));
        if (k < 0 || k >= n || !t.matches?.(":focus-visible")) return;
        focused = true; vel = 0;
        x = clamp(width() / 2 - centers[k], -period, 0); paint();
      };
      const onFocusOut = () => { focused = false; };

      if (pauseOnHover) { root.addEventListener("pointerenter", onEnter); root.addEventListener("pointerleave", onLeave); }
      root.addEventListener("keydown", onKeyDown);
      root.addEventListener("focusin", onFocusIn);
      root.addEventListener("focusout", onFocusOut);
      window.addEventListener("resize", scheduleMeasure);
      const ro = new ResizeObserver(scheduleMeasure); ro.observe(root); ro.observe(slots[0]);
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }); io.observe(root);
      gsap.ticker.add(update);

      return () => {
        if (period) place.current = x / period; /* remembered, so a re-render does not throw the strip back to the start */
        gsap.ticker.remove(update);
        cancelAnimationFrame(resizeRaf); clearTimeout(releaseTimer);
        ro.disconnect(); io.disconnect();
        root.removeEventListener("pointerenter", onEnter); root.removeEventListener("pointerleave", onLeave);
        root.removeEventListener("keydown", onKeyDown); root.removeEventListener("focusin", onFocusIn); root.removeEventListener("focusout", onFocusOut);
        window.removeEventListener("resize", scheduleMeasure);
        drag?.kill();
        impulse = null;
      };
    }, root);

    return () => { media.revert(); if (apiRef) apiRef.current = null; };
  }, [n, copies, speed, pauseOnHover, apiRef]);

  return (
    <div ref={rootRef} className="gs" tabIndex={0} role="region" aria-roledescription="carousel"
      aria-label="Photo gallery. Drag, or use the left and right arrow keys. Tab to a photo and press Enter to open it.">
      <div ref={trackRef} className="gs-track">
        {items.map(({ shot, i, c }) => (
          <div key={`${c}-${shot.name}`} className="gs-slot" data-copy={c ? "dup" : "orig"} aria-hidden={c ? true : undefined}>
            <Card shot={shot} dup={c > 0} dragMoved={dragMoved} onOpen={() => onOpen(i)} />
            <span className="gs-cap" aria-hidden="true"><span>{shot.alt}</span><small>{shot.cat}</small></span>
          </div>
        ))}
      </div>
    </div>
  );
}

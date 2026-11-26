"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sfx } from "../lib/sfx";
import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity } from "framer-motion";

const L = [["Places", "#places"], ["Map", "#map"], ["Food", "#food"], ["Stay", "#stay"], ["Plan", "#plan"], ["Guide", "#guide"], ["Season", "#when"]];
// Section ids top to bottom, and which nav item each one belongs to (anything past the last item gets no highlight).
const SPY = ["places", "gems", "map", "moments", "food", "stay", "plan", "guide", "when", "festivals", "traditions", "gallery", "stories", "help"];
const ALIAS = { gems: "places", moments: "map", festivals: "when", traditions: "when" };
// Under-damped springs on purpose: they overshoot and wobble, which is the jelly.
const JELLY = { type: "spring", stiffness: 520, damping: 11, mass: 0.7 };
const MA = motion.create("a"), ML = motion.create(Link);

export default function Nav() {
  const path = usePathname(), home = path === "/";
  const C = home ? MA : ML, to = (h) => (home ? h : "/" + h);
  const [s, setS] = useState(false), [o, setO] = useState(false), [active, setActive] = useState(null);
  const ref = useRef(null), pill = useRef(null), items = useRef({}), lock = useRef(0), recalc = useRef(() => {});
  const x = useMotionValue(0), w = useMotionValue(0), pop = useMotionValue(1), on = useMotionValue(0);
  // The lens stretches along its direction of travel and squashes across it, scaled by how fast it moves.
  const stretch = useSpring(useTransform(useVelocity(x), (v) => 1 + Math.min(Math.abs(v) / 2400, 0.5)), { stiffness: 260, damping: 20 });
  const sx = useTransform([stretch, pop], ([a, b]) => a * b);
  const sy = useTransform([stretch, pop], ([a, b]) => (1 - (a - 1) * 0.6) * (2 - b));

  useEffect(() => { const f = () => setS(scrollY > 40); f(); addEventListener("scroll", f, { passive: true }); return () => removeEventListener("scroll", f); }, []);
  useEffect(() => { document.documentElement.style.overflow = o ? "hidden" : ""; }, [o]);

  // Scroll-spy on the home page; the detail pages keep "Places" lit.
  useEffect(() => {
    if (!home) { setActive(path.startsWith("/places") ? "#places" : null); return; }
    let raf = 0;
    const calc = () => {
      raf = 0; if (Date.now() < lock.current) return;
      const y = innerHeight * 0.4; let cur = null;
      for (const id of SPY) { const e = document.getElementById(id); if (e && e.getBoundingClientRect().top <= y) cur = id; }
      const h = cur ? "#" + (ALIAS[cur] || cur) : null;
      setActive(L.some(([, k]) => k === h) ? h : null);
    };
    recalc.current = () => { if (!raf) raf = requestAnimationFrame(calc); };
    recalc.current(); addEventListener("scroll", recalc.current, { passive: true }); addEventListener("resize", recalc.current);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", recalc.current); removeEventListener("resize", recalc.current); };
  }, [home, path]);

  const measure = useCallback(() => { const el = items.current[active]; return el ? [el.offsetLeft, el.offsetWidth] : null; }, [active]);
  // Move the lens to the active link with a wobble; the first appearance jumps into place and pops in.
  useEffect(() => {
    const m = measure();
    if (!m) { animate(on, 0, { duration: 0.25 }); return; }
    if (on.get() === 0) { x.jump(m[0]); w.jump(m[1]); } else { animate(x, m[0], JELLY); animate(w, m[1], { ...JELLY, damping: 9 }); sfx("nav-lens"); }
    animate(on, 1, { duration: 0.2 });
    animate(pop, [1, 1.14, 0.92, 1.05, 1], { duration: 0.7, ease: "easeOut" });
  }, [active, measure, on, x, w, pop]);
  // Keep the lens aligned when the pill changes size (resize, font load) without animating.
  useEffect(() => {
    const el = pill.current; if (!el) return;
    const fit = () => { const m = measure(); if (m) { x.jump(m[0]); w.jump(m[1]); } };
    const ro = new ResizeObserver(fit); ro.observe(el); document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [measure, x, w]);

  const go = (h) => { lock.current = Date.now() + 1400; setActive(h); setTimeout(() => recalc.current(), 1500); };
  const tap = { whileHover: { scale: 1.1 }, whileTap: { scale: 0.84 }, transition: JELLY };

  return (
    <header ref={ref} className={"nav" + (s ? " s" : "")}>
      <C className="logo" href={home ? "#top" : "/"} aria-label="Udupi, back to top" {...tap} whileHover={{ scale: 1.07 }}>Udupi<i /></C>
      <nav className="pill" ref={pill} aria-label="Primary">
        <motion.span className="lens" aria-hidden="true" style={{ x, width: w, scaleX: sx, scaleY: sy, opacity: on }} />
        {L.map(([n, h]) => (
          <C key={h} href={to(h)} ref={(e) => { items.current[h] = e; }} className={active === h ? "on" : ""} aria-current={active === h ? "true" : undefined} onClick={() => go(h)} {...tap}>{n}</C>
        ))}
      </nav>
      <C className="btn nbtn" data-magnet href={to("#plan")} onClick={() => go("#plan")} {...tap} whileHover={{ scale: 1.06 }}>Plan your trip</C>
      <motion.button className="mbtn" aria-expanded={o} aria-controls="mnav" onClick={() => setO(!o)} whileTap={{ scale: 0.82 }} transition={JELLY}>{o ? "Close" : "Menu"}</motion.button>
      <div id="mnav" className={"mnav" + (o ? " o" : "")} aria-hidden={!o}>
        {L.map(([n, h], i) => (home
          ? <a key={h} href={h} tabIndex={o ? 0 : -1} style={{ transitionDelay: o ? `${0.15 + i * 0.05}s` : "0s" }} onClick={() => setO(false)}>{n}</a>
          : <Link key={h} href={"/" + h} tabIndex={o ? 0 : -1} style={{ transitionDelay: o ? `${0.15 + i * 0.05}s` : "0s" }} onClick={() => setO(false)}>{n}</Link>))}
        {home ? <a className="btn" href="#plan" tabIndex={o ? 0 : -1} onClick={() => setO(false)}>Plan your trip</a> : <Link className="btn" href="/#plan" tabIndex={o ? 0 : -1} onClick={() => setO(false)}>Plan your trip</Link>}
      </div>
    </header>
  );
}

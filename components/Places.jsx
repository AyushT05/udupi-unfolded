"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Tilt from "./Tilt";
import Photo from "./Photo";
import Head from "./Head";
import { kindOf } from "./Scene";
import { P, HUBS, CT, dirs, km } from "../lib/data";
import { DET } from "../lib/details";
const E = [0.2, 0.7, 0.2, 1], DELAY = 6500, SLOW = 1.8; // while the pointer rests on the stage the slideshow keeps going, 1.8x slower
const FILTERS = [["all", "All"], ...Object.entries(CT), ["gem", "Beyond town"]];
const short = (n) => n.replace(/\s*\(.*\)/, "");
const pad = (n) => String(n).padStart(2, "0");
const Arrow = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export function Places() {
  const [f, setF] = useState("all"), [q, setQ] = useState(""), [act, setAct] = useState("matha"), [car, setCar] = useState(true);
  const touch = useRef(0), sec = useRef(null), sw = useRef(null), reduce = useReducedMotion();
  const { scrollYProgress: sp } = useScroll({ target: sw, offset: ["start end", "start 0.25"] }), sc = useTransform(sp, [0, 1], [0.88, 1]);
  const [play, setPlay] = useState(true), [hold, setHold] = useState(false), [seen, setSeen] = useState(false);
  const list = useMemo(() => P.filter((p) => (f === "all" || p.c === f || (f === "gem" && p.g)) && (p.n + p.d + p.tag + CT[p.c] + DET[p.id].s).toLowerCase().includes(q.toLowerCase())), [f, q]);
  const idx = Math.max(0, list.findIndex((p) => p.id === act)), cur = list[idx], n = list.length;
  const go = (d) => setAct(list[(idx + d + n) % n].id);
  // Auto-advance: only while the section is on screen, not hovered or keyboard-focused, and the person has not paused it.
  useEffect(() => { const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.3 }); io.observe(sec.current); return () => io.disconnect(); }, []);
  const running = play && seen && n > 1, prog = useMotionValue(0), live = useRef({ hold: false, go: () => {} }), pr = useRef(0);
  live.current = { hold, go };
  useEffect(() => { pr.current = 0; prog.set(0); }, [act, prog]); // a manual change restarts the countdown
  // One clock, two speeds: progress fills at full speed normally and at 1/SLOW speed while the pointer or keyboard focus is on the stage,
  // so hovering never stops the show or resets it, it just lets each photograph stay a little longer.
  useEffect(() => {
    if (!running || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, last = performance.now();
    const tick = (t) => {
      const dt = Math.min(t - last, 120); last = t;
      pr.current += dt / (live.current.hold ? DELAY * SLOW : DELAY); prog.set(Math.min(pr.current, 1));
      if (pr.current >= 1) { pr.current = 0; live.current.go(1); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [running, prog]);
  const vis = Math.min(5, n), off = Math.min(Math.max(idx - 2, 0), Math.max(0, n - 5));
  const key = (e) => { if (/^Arrow(Down|Right)$/.test(e.key)) { e.preventDefault(); go(1); } else if (/^Arrow(Up|Left)$/.test(e.key)) { e.preventDefault(); go(-1); } };
  return (
    <section id="places" className="sec ink" ref={sec}>
      <div className="wrap">
        <Head n="02" label="Places" lede={`From Udupi’s temple quarter to the northern beaches and the foothills of the Western Ghats, explore the places that give this district its character.`}>Places to <b>discover</b></Head>
        <div className="tools">
          <div className="chips" role="group" aria-label="Filter places">{FILTERS.map(([k, l]) => <button key={k} className="chip" aria-pressed={f === k} onClick={() => setF(k)}>{l}</button>)}</div>
          <button className="chip sur" onClick={() => { const o = list.filter((x) => x.id !== act); if (o.length) setAct(o[Math.floor(Math.random() * o.length)].id); }}>Surprise me</button>
          <input className="search" type="search" aria-label="Search places" placeholder="Search a place or a mood" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {cur ? (
          <motion.div ref={sw} className="stgsc" style={reduce ? undefined : { scale: sc }}>
            <div className={"stg" + (car ? " withcar" : "")} data-live={seen ? "1" : "0"} tabIndex={0} onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)} onPointerLeave={() => setHold(false)} onFocus={(e) => e.target.matches(":focus-visible") && setHold(true)} onBlur={() => setHold(false)} role="group" aria-roledescription="carousel" aria-label="Places to wander" onKeyDown={key}
              onTouchStart={(e) => { touch.current = e.touches[0].clientX; }} onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - touch.current; if (Math.abs(d) > 60) go(d < 0 ? 1 : -1); }}>
              <div className="sbg" aria-hidden="true">
                <AnimatePresence initial={false}>
                  <motion.div key={cur.id} className="sfill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, ease: "easeInOut" }}>
                    <Photo id={cur.g ? `gem-${cur.id}` : cur.id} fallback={cur.id} kind={kindOf(cur.c)} alt="" priority />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="sshade" aria-hidden="true" />
              <div className="stg-top">
                <span className="n">{pad(idx + 1)} / {pad(n)}</span>
                <span className="pcat">{CT[cur.c]}</span>
                <button className="gbtn" aria-pressed={!play} onClick={() => setPlay(!play)}>
                  {play ? <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="2.5" width="3.2" height="11" rx="1" fill="currentColor" /><rect x="9.3" y="2.5" width="3.2" height="11" rx="1" fill="currentColor" /></svg> : <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 2.8v10.4L13 8z" fill="currentColor" /></svg>}
                  {play ? "Pause" : "Play"}
                </button>
                <button className="gbtn" aria-pressed={!car} onClick={() => setCar(!car)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="1.5" width="6" height="3.6" rx="1.2" fill="currentColor" /><rect x="5" y="6.2" width="6" height="3.6" rx="1.2" fill="currentColor" opacity=".6" /><rect x="5" y="10.9" width="6" height="3.6" rx="1.2" fill="currentColor" opacity=".35" /></svg>
                  {car ? "Hide gallery" : "Show gallery"}
                </button>
              </div>
              <div className="stg-mid">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h3 key={cur.id} className="stg-title" initial={{ opacity: 0, y: 28, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -20, filter: "blur(8px)" }} transition={{ duration: 0.55, ease: E }}>{short(cur.n)}</motion.h3>
                </AnimatePresence>
              </div>
              <div className="pcar-pos">
                <AnimatePresence>
                  {car && (
                    <motion.div className="pcar" style={{ "--v": vis, "--o": off }} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ type: "spring", stiffness: 380, damping: 18 }}>
                      <div className="pcar-win" data-lenis-prevent>
                        <ul className="pcar-list">
                          {list.map((p) => (
                            <li key={p.id}>
                              <button className={"pth" + (p.id === cur.id ? " on" : "")} aria-label={p.n} aria-current={p.id === cur.id} tabIndex={p.id === cur.id ? 0 : -1} onClick={() => setAct(p.id)}>
                                <Photo id={p.g ? `gem-${p.id}` : p.id} fallback={p.id} kind={kindOf(p.c)} alt="" />
                              </button>
                            </li>))}
                        </ul>
                      </div>
                    </motion.div>)}
                </AnimatePresence>
              </div>
              <div className="stg-info" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={cur.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: E }}>
                    <p className="pcat">{cur.tag}</p>
                    <p className="stg-d">{DET[cur.id].s}</p>
                    <p className="ptip">{cur.t}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="stg-bar" aria-hidden="true"><motion.i style={{ scaleX: prog }} /></div>
              <div className="stg-act">
                <a className="btn line" href={dirs(cur)} target="_blank" rel="noopener" data-magnet>Directions</a>
                <Link className="btn rm" href={`/places/${cur.id}`} data-curtain data-magnet>Read more <Arrow /></Link>
              </div>
            </div>
            <p className="note">Explore the collection with the arrows, a swipe or the image rail.</p>
          </motion.div>
        ) : <p className="lede">No places match that search. Try another name or category.</p>}
      </div>
    </section>
  );
}

export function Gems() {
  const g = P.filter((p) => p.g);
  return (
    <section id="gems" className="sec sand">
      <div className="wrap">
        <Head n="03" label="Beyond town" lede="A little beyond the familiar coast: historic settlements, village shorelines and hilltop shrines that reward a slower journey.">Beyond the <b>familiar coast</b></Head>
        <div className="gems">
          {g.map((p, i) => (
            <Tilt key={p.id} className="gc" par={[24, 58, 16][i % 3]} initial={{ opacity: 0, y: 60, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: "-8%" }} transition={{ duration: 1, ease: E }}>
              <div className="gc-img"><Photo id={`gem-${p.id}`} fallback={p.id} kind={kindOf(p.c)} alt={p.n} /></div>
              <div className="pblur" aria-hidden="true"><i /><i /><i /><i /></div>
              <div className="gc-shade" aria-hidden="true" />
              <div className="gc-body">
                <h3>{p.n}</h3>
                <p className="gc-d">{DET[p.id].s}</p>
                <div className="gc-pills">
                  <span><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.3 4.2 13.3l.7-4.3-3.1-3 4.3-.6z" fill="currentColor" /></svg>{CT[p.c]}</span>
                  <span><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 14s5-4.2 5-8a5 5 0 10-10 0c0 3.8 5 8 5 8z" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="8" cy="6" r="1.7" fill="currentColor" /></svg>~{Math.round(km(HUBS[0], p))} km from Udupi</span>
                </div>
                <Link className="gc-btn" href={`/places/${p.id}`} data-curtain>Read more<span className="sr-only"> about {p.n}</span></Link>
              </div>
            </Tilt>))}
        </div>
      </div>
    </section>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Photo from "./Photo";
const SL = [["hero-1", "malpe", "beach"], ["hero-2", "stm", "island"], ["hero-3", "matha", "temple"], ["hero-4", "hasta", "heritage"]]; // [photo, fallback if the photo is missing, kind]
const E = [0.2, 0.7, 0.2, 1], HOLD = 7000, FADE = 1600;
// Slides stay mounted and stacked. The incoming photo fades in over the outgoing one, which stays fully opaque underneath until it is covered,
// so there is no dip to dark, no second fade inside the <img>, and the outgoing photo's slow zoom never restarts.
export default function Hero() {
  const [cur, setCur] = useState(0), [prev, setPrev] = useState(null), [live, setLive] = useState(true), reduce = useReducedMotion();
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setLive(v < innerHeight * 1.05));
  // As the next chapter slides up over the pinned hero, the photo pushes in, dims, and the words drift up and out.
  const push = useTransform(scrollY, [0, 900], [1, 1.12]), dim = useTransform(scrollY, [0, 800], [0, 0.72]);
  const ty = useTransform(scrollY, [0, 900], [0, -110]), to = useTransform(scrollY, [0, 520], [1, 0]);
  useEffect(() => { SL.forEach(([id]) => { const im = new Image(); im.decoding = "async"; im.src = `/img/${id}.jpg`; im.decode?.().catch(() => {}); }); }, []);
  const go = useCallback((k) => { if (k === cur || prev !== null) return; setPrev(cur); setCur(k); }, [cur, prev]);
  useEffect(() => { if (prev === null) return; const t = setTimeout(() => setPrev(null), FADE + 150); return () => clearTimeout(t); }, [prev]);
  useEffect(() => { if (!live) return; const t = setTimeout(() => go((cur + 1) % SL.length), HOLD); return () => clearTimeout(t); }, [cur, live, go]);
  return (
    <section id="top" className="hero" aria-label="Udupi" data-live={live ? "1" : "0"}>
      <motion.div className="hstage" style={reduce ? undefined : { scale: push }}>
        {SL.map(([id, fb, kind], k) => (
          <div key={id} className={"slide" + (k === cur ? " is-cur on" : k === prev ? " is-prev on" : "")} aria-hidden="true">
            <Photo id={id} fallback={fb} kind={kind} alt="" priority={k === 0} scene="error" />
          </div>))}
      </motion.div>
      <motion.div className="hdim" aria-hidden="true" style={reduce ? undefined : { opacity: dim }} />
      <div className="hshade" />
      <motion.div className="hbody" style={reduce ? undefined : { y: ty, opacity: to }}>
        <div className="hl">
          <h1 aria-label="Udupi">{[..."Udupi"].map((c, k) => <span key={k} className="ch" aria-hidden="true"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.3, delay: 1.2 + k * 0.08, ease: E }}>{c}</motion.span></span>)}</h1>
          <motion.p className="tag" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.9, duration: 1 }}>A coastal district of temple traditions, fishing harbours, island geology and a cuisine with a life of its own.</motion.p>
          <motion.div className="hcta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
            <a className="btn" href="#places" data-magnet>Explore Udupi</a><a className="btn line" href="#plan" data-magnet>Plan your journey</a>
          </motion.div>
        </div>
      </motion.div>
      <a className="cue" href="#discover" aria-label="Scroll to discover"><span /></a>
    </section>
  );
}

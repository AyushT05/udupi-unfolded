"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Photo from "./Photo";
import Head from "./Head";
import { kindOf } from "./Scene";
import { MOMENTS, byId } from "../lib/data";
// The section pins to the screen and your vertical scroll slides the row of photographs sideways. The photographs drift against the row for depth.
export default function Moments() {
  const sec = useRef(null), track = useRef(null), reduce = useReducedMotion(), [dist, setDist] = useState(0), [idx, setIdx] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: sec, offset: ["start start", "end end"] });
  const x = useTransform(p, [0, 1], [0, -dist]), drift = useTransform(p, [0, 1], [38, -38]), bar = useTransform(p, [0, 1], [0.04, 1]);
  useEffect(() => {
    const m = () => { const t = track.current; if (t) setDist(Math.max(0, t.scrollWidth - document.documentElement.clientWidth)); };
    m(); const ro = new ResizeObserver(m); ro.observe(track.current); addEventListener("resize", m); document.fonts?.ready.then(m);
    return () => { ro.disconnect(); removeEventListener("resize", m); };
  }, []);
  useMotionValueEvent(p, "change", (v) => setIdx(Math.min(MOMENTS.length - 1, Math.round(v * (MOMENTS.length - 1)))));
  const jump = (d) => { const k = Math.max(0, Math.min(MOMENTS.length - 1, idx + d)), top = sec.current.offsetTop + (k / (MOMENTS.length - 1)) * dist; scrollTo({ top, behavior: "smooth" }); };
  const pinned = !reduce && dist > 0;
  return (
    <section id="moments" className="sand mom-sec" ref={sec} style={pinned ? { height: `calc(100svh + ${dist}px)` } : undefined}>
      <div className={pinned ? "momstick" : "momstick flat"}>
        <div className="wrap">
          <div className="headrow"><Head n="05" label="Experiences">Six ways to <b>experience Udupi</b></Head>
            <div className="arrows"><span className="momn" aria-hidden="true">{String(idx + 1).padStart(2, "0")} / {String(MOMENTS.length).padStart(2, "0")}</span><button className="chip" onClick={() => jump(-1)} aria-label="Previous">Prev</button><button className="chip" onClick={() => jump(1)} aria-label="Next">Next</button></div></div>
        </div>
        <motion.div className="car" ref={track} style={pinned ? { x } : undefined}>
          {MOMENTS.map(([id, t, c], i) => (
            <article className="mom" key={t}>
              <motion.div className="momimg" style={pinned ? { x: drift } : undefined}><Photo id={`mom-${i + 1}`} fallback={id} kind={kindOf(byId(id).c)} alt={t} /></motion.div>
              <div className="mom-copy"><small>0{i + 1}</small><h3>{t}</h3><p>{c}</p></div>
            </article>))}
        </motion.div>
        {pinned && <div className="momprog" aria-hidden="true"><motion.i style={{ scaleX: bar }} /></div>}
      </div>
    </section>
  );
}

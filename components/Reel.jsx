"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Photo from "./Photo";
import { REEL, P } from "../lib/data";
export default function Reel() {
  const ref = useRef(null), tr = useRef(null), [dist, setD] = useState(0), [vh, setVh] = useState(800);
  useEffect(() => { // scroll distance is measured from the real track width, so it adapts to any screen
    const m = () => { const s = tr.current.parentElement; setVh(innerHeight); setD(Math.max(0, tr.current.offsetWidth - (s.clientWidth - parseFloat(getComputedStyle(s).paddingLeft)) + 40)); };
    m(); addEventListener("resize", m); return () => removeEventListener("resize", m);
  }, []);
  const { scrollYProgress: p } = useScroll({ target: ref }), x = useTransform(p, [0, 1], [0, -dist]);
  return (
    <section ref={ref} className="reel d" style={{ height: dist + vh }} aria-label="Moments on the coast">
      <div className="stick"><h2 className="big">One coast, <b>six moods</b></h2>
        <motion.div ref={tr} className="track" style={{ x }}>{REEL.map(([id, t, c]) => <article key={t} className="pn" data-cursor><Photo id={id} label="" tone={P.find((q) => q.id == id).c} /><h3>{t}</h3><p>{c}</p></article>)}</motion.div></div>
    </section>
  );
}

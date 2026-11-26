"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Lenis from "lenis";
const L = [["Places", "#places"], ["Map", "#map"], ["Food", "#food"], ["When", "#when"], ["Practical", "#help"]];
export default function Chrome() {
  const [s, setS] = useState(false), [o, setO] = useState(false), [big, setBig] = useState(false);
  const x = useMotionValue(-100), y = useMotionValue(-100), sx = useSpring(x, { stiffness: 500, damping: 40 }), sy = useSpring(y, { stiffness: 500, damping: 40 });
  useEffect(() => {
    const rm = matchMedia("(prefers-reduced-motion: reduce)").matches; let lenis, raf;
    if (!rm) { lenis = new Lenis(); const f = (t) => { lenis.raf(t); raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); }
    const sc = () => setS(scrollY > 60), mv = (e) => { document.body.classList.add("has-cur"); x.set(e.clientX); y.set(e.clientY); setBig(!!e.target.closest?.("a,button,.row,[data-cursor]")); };
    const ck = (e) => { const a = e.target.closest?.('a[href^="#"]'); if (a && lenis) { e.preventDefault(); lenis.scrollTo(a.getAttribute("href")); setO(false); } };
    addEventListener("scroll", sc, { passive: true }); addEventListener("mousemove", mv); addEventListener("click", ck);
    return () => { document.body.classList.remove("has-cur"); cancelAnimationFrame(raf); lenis?.destroy(); removeEventListener("scroll", sc); removeEventListener("mousemove", mv); removeEventListener("click", ck); };
  }, []);
  return (<>
    <nav className={"nav" + (s ? " s" : "")}><a className="logo" href="#hero">Udupi</a>
      <button className="mb" aria-expanded={o} onClick={() => setO(!o)}>Menu</button>
      <div className={"links" + (o ? " o" : "")}>{L.map(([n, h]) => <a key={h} href={h} onClick={() => setO(false)}>{n}</a>)}<a className="btn" href="#plan" onClick={() => setO(false)}>Plan your trip</a></div></nav>
    <motion.div className="cur" style={{ x: sx, y: sy }} animate={{ scale: big ? 2.6 : 1 }} aria-hidden="true" />
  </>);
}

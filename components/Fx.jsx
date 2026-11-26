"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring } from "framer-motion";
import { sfx } from "../lib/sfx";
// A reading-progress line, a custom cursor and buttons that lean toward the pointer.
// The cursor is the only pointer on screen (the system arrow is hidden while it runs): a small ring and dot that grows over things you can press.
const SIZE = { idle: 34, link: 62 };
export default function Fx() {
  const { scrollYProgress } = useScroll(), bar = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  const x = useMotionValue(-100), y = useMotionValue(-100), rx = useSpring(x, { stiffness: 420, damping: 34, mass: 0.35 }), ry = useSpring(y, { stiffness: 420, damping: 34, mass: 0.35 });
  const [fine, setFine] = useState(false), [mode, setMode] = useState("idle"), [down, setDown] = useState(false);
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setFine(true);
    document.documentElement.classList.add("nocur"); // hides the system cursor; removed again on cleanup
    let mag = null, kk = "idle";
    const reset = () => { if (mag) { mag.style.translate = ""; mag = null; } };
    const move = (e) => {
      x.set(e.clientX); y.set(e.clientY);
      const k = e.target.closest?.("a,button,summary,input,select,textarea,label,[role=button]") ? "link" : "idle";
      if (k !== kk) { if (k === "link") sfx("cursor-link-in"); kk = k; setMode(k); }
      const m = e.target.closest?.("[data-magnet]");
      if (m !== mag) reset();
      if (m) { mag = m; const r = m.getBoundingClientRect(); m.style.translate = `${(e.clientX - (r.left + r.width / 2)) * 0.22}px ${(e.clientY - (r.top + r.height / 2)) * 0.32}px`; }
    };
    const dn = () => { setDown(true); sfx("cursor-press"); }, up = () => { setDown(false); sfx("cursor-release"); }, leave = () => { x.set(-100); y.set(-100); reset(); };
    addEventListener("pointermove", move, { passive: true }); addEventListener("pointerdown", dn); addEventListener("pointerup", up); document.documentElement.addEventListener("mouseleave", leave);
    return () => { document.documentElement.classList.remove("nocur"); removeEventListener("pointermove", move); removeEventListener("pointerdown", dn); removeEventListener("pointerup", up); document.documentElement.removeEventListener("mouseleave", leave); };
  }, [x, y]);
  const d = SIZE[mode] * (down ? 0.86 : 1);
  return (
    <>
      <motion.div className="sbar" style={{ scaleX: bar }} aria-hidden="true" />
      {fine && <>
        <motion.div className="cring" aria-hidden="true" style={{ x: rx, y: ry }}>
          <motion.i className={mode} initial={false} animate={{ width: d, height: d, x: -d / 2, y: -d / 2 }} transition={{ type: "spring", stiffness: 340, damping: 19, mass: 0.7 }} />
        </motion.div>
        <motion.div className="cdot" aria-hidden="true" style={{ x, y }} />
      </>}
    </>
  );
}

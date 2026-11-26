"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
// A short first-visit intro. Skipped on repeat visits in the same tab and for reduced motion.
export default function Loader() {
  const [on, setOn] = useState(true), [go, setGo] = useState(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || sessionStorage.getItem("udupi-seen")) { setOn(false); return; }
    sessionStorage.setItem("udupi-seen", "1");
    // Lift the curtain only once the first hero photo is in (at least 0.9s, at most 3.5s), so the page never shows a placeholder.
    const min = new Promise((r) => setTimeout(r, 900)), img = new Promise((r) => { const im = new Image(); im.onload = im.onerror = r; im.src = "/img/malpe.jpg"; }), cap = new Promise((r) => setTimeout(r, 3500));
    Promise.race([Promise.all([min, img]), cap]).then(() => setGo(true));
  }, []);
  if (!on) return null;
  return (
    <motion.div className="loader" initial={{ y: 0 }} animate={{ y: go ? "-100%" : 0 }} transition={{ duration: 0.85, ease: [0.7, 0, 0.2, 1] }} onAnimationComplete={() => setOn(false)} aria-hidden="true">
      <motion.span initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>Udupi<i /></motion.span>
    </motion.div>
  );
}

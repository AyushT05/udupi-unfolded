"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
export default function Curtain() {
  const [on, setOn] = useState(true);
  useEffect(() => { if (matchMedia("(prefers-reduced-motion: reduce)").matches) setOn(false); }, []);
  if (!on) return null;
  return (<motion.div className="curtain" initial={{ y: 0 }} animate={{ y: "-100%" }} transition={{ delay: 1.1, duration: 0.9, ease: [0.7, 0, 0.2, 1] }} onAnimationComplete={() => setOn(false)} aria-hidden="true">
    <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>Udupi</motion.span></motion.div>);
}

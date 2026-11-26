"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
// A line of big type that is pulled sideways by the page's own scroll, and leans into the direction you are scrolling.
export default function Ticker({ words, dir = 1, tone = "sand" }) {
  const ref = useRef(null), { scrollYProgress: p, scrollY } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(p, [0, 1], dir > 0 ? ["0%", "-38%"] : ["-38%", "0%"]);
  const sk = useSpring(useTransform(useVelocity(scrollY), [-3000, 0, 3000], [7, 0, -7]), { stiffness: 140, damping: 22 });
  const row = [...words, ...words, ...words];
  return (
    <div className={"ticker " + tone} ref={ref} aria-hidden="true">
      <motion.div className="tkrow" style={{ x, skewX: sk }}>
        {row.map((w, i) => <span key={i} className={i % 2 ? "o" : ""}>{w}<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 1c.7 6.5 4.5 10.3 11 11-6.5.7-10.3 4.5-11 11-.7-6.5-4.5-10.3-11-11C7.5 11.3 11.3 7.5 12 1z" fill="currentColor" /></svg></span>)}
      </motion.div>
    </div>
  );
}

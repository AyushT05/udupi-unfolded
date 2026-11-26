"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Photo from "./Photo";
import useLive from "./useLive";
import { sfxOnce } from "../lib/sfx";
const EZ = [0.23, 1, 0.32, 1];
// A photograph set into the middle of a place story. Same treatment as the festival frames: it opens like a curtain from its bottom
// edge once, then the photograph drifts against the frame as you scroll while it slowly zooms. The caption fades in underneath.
// slot = your own photo (public/img/<slot>.jpg), fb = fallback photo id; with neither, an illustrated scene is shown.
export default function Figure({ slot, fb, kind, caption, n = 0 }) {
  const [ref, live] = useLive(), r2 = useRef(null);
  const { scrollYProgress: p } = useScroll({ target: r2, offset: ["start end", "end start"] }), y = useTransform(p, [0, 1], ["-7%", "7%"]);
  return (
    <figure className={"pd-fig v" + (n % 3)}>
      <motion.div className="fph" ref={(el) => { ref.current = el; r2.current = el; }} data-live={live} initial={{ clipPath: "inset(100% 0 0 0)" }} whileInView={{ clipPath: "inset(0% 0 0 0)" }} onViewportEnter={() => sfxOnce("figure-reveal", "fig:" + (slot || caption))} viewport={{ once: true, margin: "0px 0px -12% 0px" }} transition={{ duration: 1.4, ease: EZ }}>
        <motion.div className="fpar" style={{ y }}><Photo id={slot} fallback={fb || undefined} kind={kind} alt={caption} scene="error" /></motion.div>
      </motion.div>
      <motion.figcaption initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -8% 0px" }} transition={{ duration: 0.9, delay: 0.5, ease: EZ }}><span className="n">{String(n + 1).padStart(2, "0")}</span>{caption}</motion.figcaption>
    </figure>
  );
}

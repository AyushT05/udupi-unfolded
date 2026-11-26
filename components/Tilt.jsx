"use client";
import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
// A card that leans toward the pointer (mouse only) with a moving highlight, and drifts at its own speed as you scroll past.
export default function Tilt({ children, className, par = 0, ...rest }) {
  const ref = useRef(null), rx = useSpring(0, { stiffness: 170, damping: 15 }), ry = useSpring(0, { stiffness: 170, damping: 15 });
  const hx = useMotionValue(50), hy = useMotionValue(50), glow = useMotionTemplate`radial-gradient(circle at ${hx}% ${hy}%, rgba(255,255,255,.26), rgba(255,255,255,0) 46%)`;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] }), py = useTransform(scrollYProgress, [0, 1], [par, -par]);
  const move = (e) => { if (e.pointerType !== "mouse") return; const r = ref.current.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, qy = (e.clientY - r.top) / r.height; ry.set((px - 0.5) * 11); rx.set((0.5 - qy) * 9); hx.set(px * 100); hy.set(qy * 100); };
  const leave = () => { rx.set(0); ry.set(0); };
  return (
    <motion.div ref={ref} className="tiltw" style={{ y: py }}>
      <motion.article className={className} style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }} onPointerMove={move} onPointerLeave={leave} {...rest}>
        {children}
        <motion.span className="shine" aria-hidden="true" style={{ background: glow }} />
      </motion.article>
    </motion.div>
  );
}

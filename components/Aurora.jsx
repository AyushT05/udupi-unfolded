"use client";
import { useEffect, useRef } from "react";
// Interactive gradient field: slow drifting colour blobs that lean toward the pointer, drawn on a small canvas
// (scaled up, so it stays soft and cheap). Pauses off-screen; renders one still frame for reduced motion.
const COLS = [[19, 78, 90], [242, 169, 63], [47, 124, 128], [217, 141, 58], [11, 60, 70]];
export default function Aurora({ className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, x = c.getContext("2d"), host = c.parentElement, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 1, h = 1, raf = 0, on = true; const m = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, a: 0, ta: 0 };
    const size = () => { const r = c.getBoundingClientRect(), d = 0.35; w = c.width = Math.max(2, (r.width * d) | 0); h = c.height = Math.max(2, (r.height * d) | 0); };
    const blob = (px, py, r, col, a) => { const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.fillRect(0, 0, w, h); };
    const draw = (t) => {
      m.x += (m.tx - m.x) * 0.06; m.y += (m.ty - m.y) * 0.06; m.a += (m.ta - m.a) * 0.05;
      x.globalCompositeOperation = "source-over"; x.fillStyle = "#061a20"; x.fillRect(0, 0, w, h); x.globalCompositeOperation = "lighter";
      COLS.forEach((col, i) => { const s = 0.00018 + i * 0.00005, p = i * 1.7; blob((0.5 + Math.cos(t * s + p) * 0.34 + (m.x - 0.5) * 0.18 * (i % 2 ? 1 : -1)) * w, (0.5 + Math.sin(t * s * 1.3 + p) * 0.32 + (m.y - 0.5) * 0.18) * h, (0.42 + (i % 3) * 0.1) * Math.max(w, h), col, i === 1 || i === 3 ? 0.34 : 0.55); });
      blob(m.x * w, m.y * h, 0.3 * Math.max(w, h), COLS[1], 0.45 * m.a);
      if (!reduce && on) raf = requestAnimationFrame(draw);
    };
    const move = (e) => { const r = host.getBoundingClientRect(); m.tx = (e.clientX - r.left) / r.width; m.ty = (e.clientY - r.top) / r.height; m.ta = 1; };
    const leave = () => { m.ta = 0; };
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; cancelAnimationFrame(raf); if (on) raf = requestAnimationFrame(draw); });
    size(); draw(2000); io.observe(host); addEventListener("resize", size);
    host.addEventListener("pointermove", move); host.addEventListener("pointerleave", leave);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", size); host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave); };
  }, []);
  return <canvas ref={ref} className={"aurora " + className} aria-hidden="true" />;
}

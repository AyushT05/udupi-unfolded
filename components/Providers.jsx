"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MotionConfig } from "framer-motion";
import Lenis from "lenis";
import Fx from "./Fx";
import { sfx } from "../lib/sfx";
const Ctx = createContext({ go: () => {} });
export const useGo = () => useContext(Ctx).go;
// Smooth scrolling, a curtain that wipes between pages, and site-wide reduced-motion handling.
export default function Providers({ children }) {
  const router = useRouter(), path = usePathname(), [phase, setPhase] = useState("idle"), pending = useRef(false), last = useRef(path), busy = useRef(false);
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const go = useCallback((href) => {
    if (reduced() || busy.current) { router.push(href); return; }
    busy.current = true; pending.current = true; setPhase("in"); sfx("page-curtain");
    setTimeout(() => router.push(href), 640);
    setTimeout(() => { if (pending.current) { pending.current = false; setPhase("out"); setTimeout(() => { setPhase("idle"); busy.current = false; }, 800); } }, 4500);
  }, [router]);
  useEffect(() => {
    if (last.current === path) return; last.current = path;
    if (pending.current) { pending.current = false; setPhase("out"); setTimeout(() => { setPhase("idle"); busy.current = false; }, 800); }
  }, [path]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ lerp: 0.1 });
    // Expose the single site-wide instance so modal overlays can pause smooth scrolling.
    window.__udupiLenis = l;
    let r; const f = (t) => { l.raf(t); r = requestAnimationFrame(f); }; r = requestAnimationFrame(f);
    const click = (e) => { const a = e.target.closest?.('a[href^="#"]'); const h = a?.getAttribute("href"); if (h && h.length > 1 && !h.includes("=")) { e.preventDefault(); l.scrollTo(h, { offset: -16 }); } };
    document.addEventListener("click", click);
    return () => {
      cancelAnimationFrame(r);
      l.destroy();
      if (window.__udupiLenis === l) delete window.__udupiLenis;
      document.removeEventListener("click", click);
    };
  }, []);
  // Links marked data-curtain cover the screen first, then navigate. Capture phase so Next's own Link handler does not fire early.
  useEffect(() => {
    const click = (e) => {
      const a = e.target.closest?.("a[data-curtain]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      e.preventDefault(); e.stopPropagation(); go(a.getAttribute("href"));
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, [go]);
  return (
    <MotionConfig reducedMotion="user">
      <Ctx.Provider value={{ go }}>{children}</Ctx.Provider>
      <div className={"curtain " + phase} aria-hidden="true"><span>Udupi<i /></span></div>
      <Fx />
    </MotionConfig>
  );
}

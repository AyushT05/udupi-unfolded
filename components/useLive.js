"use client";
import { useEffect, useRef, useState } from "react";
// True while the element is (nearly) on screen. Used to pause long CSS zooms that nobody can see.
export default function useLive(margin = "100px") {
  const ref = useRef(null), [live, setLive] = useState(true);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: margin }); io.observe(el); return () => io.disconnect(); }, [margin]);
  return [ref, live ? "1" : "0"];
}

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "./Head";
import GalleryStrip from "./GalleryStrip";
import { PH } from "../lib/photos.mjs";
const GP = PH.filter((p) => p.gallery);
export default function Gallery() {
  const [res, setRes] = useState({}), [i, setI] = useState(null), api = useRef(null), cl = useRef(null);
  useEffect(() => { GP.forEach((p) => { const im = new Image(); im.onload = () => setRes((r) => ({ ...r, [p.id]: 1 })); im.onerror = () => setRes((r) => ({ ...r, [p.id]: 0 })); im.src = `/img/${p.id}.jpg`; }); }, []);
  const ready = Object.keys(res).length === GP.length;
  const shots = useMemo(() => GP.filter((p) => res[p.id]).map((p) => ({ name: p.id, src: `/img/${p.id}.jpg`, alt: p.alt, cat: p.cat, pos: p.pos })), [res]);
  const n = shots.length;
  useEffect(() => {
    if (i == null) return;
    cl.current?.focus();

    // Pause the site's Lenis instance and lock the document behind the lightbox.
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const lenis = window.__udupiLenis;
    lenis?.stop();
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const k = (e) => {
      if (e.key === "Escape") setI(null);
      if (e.key === "ArrowRight") setI((x) => (x + 1) % n);
      if (e.key === "ArrowLeft") setI((x) => (x + n - 1) % n);
    };
    addEventListener("keydown", k);
    return () => {
      removeEventListener("keydown", k);
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      lenis?.start();
    };
  }, [i, n]);
  if (!ready || n < 2) return null;
  const cur = i != null ? shots[i] : null;
  return (
    <section id="gallery" className="sec sand">
      <div className="wrap">
        <div className="headrow"><Head n="13" label="Gallery">Udupi in <b>pictures</b></Head>
          <div className="arrows"><button className="chip" onClick={() => api.current?.go(-1)} aria-label="Previous photo">Prev</button><button className="chip" onClick={() => api.current?.go(1)} aria-label="Next photo">Next</button></div></div>
      </div>
      <div className="gs-bleed"><GalleryStrip shots={shots} paused={i != null} apiRef={api} onOpen={setI} /></div>
      <div className="wrap"><p className="note ghint">Browse the photographs; select any frame for a closer look.</p></div>
      <AnimatePresence>{cur && (
        <motion.div className="lb" data-lenis-prevent role="dialog" aria-modal="true" aria-label={cur.alt} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setI(null)}>
          <div className="lbi" onClick={(e) => e.stopPropagation()}>
            <img src={cur.src} alt={cur.alt} /><p>{cur.alt}</p>
            <div className="chips"><button className="chip" onClick={() => setI((i + n - 1) % n)}>Previous</button><button className="chip" onClick={() => setI((i + 1) % n)}>Next</button><button ref={cl} className="chip" onClick={() => setI(null)}>Close</button></div>
          </div>
        </motion.div>)}
      </AnimatePresence>
    </section>
  );
}

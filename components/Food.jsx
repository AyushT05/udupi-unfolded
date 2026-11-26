"use client";
import { useEffect, useRef, useState } from "react";
import Photo from "./Photo";
import Head from "./Head";
import { FOOD, CLASSICS } from "../lib/data";
// The photograph follows your reading. On every scroll frame we measure which dish sits closest to a reading line a little above the middle of
// the screen, and that dish is the active one. It is a pure function of the scroll position, so fast scrolling, Lenis easing and layout shifts
// can never leave it on the wrong dish. A deliberate click or Tab still wins for a moment. Photos are all mounted and cross-faded by opacity,
// so nothing mounts, unmounts or races while you scroll.
export default function Food() {
  const [a, setA] = useState(0), rows = useRef([]), lock = useRef(0), cur_ = useRef(0);
  const cur = FOOD[a];
  useEffect(() => {
    let raf = 0, live = false;
    const measure = () => {
      raf = 0;
      if (Date.now() < lock.current) return;
      const line = innerHeight * 0.45; let best = cur_.current, bd = Infinity;
      rows.current.forEach((r, i) => { if (!r) return; const b = r.getBoundingClientRect(); const d = line < b.top ? b.top - line : line > b.bottom ? line - b.bottom : 0; const c = Math.abs((b.top + b.bottom) / 2 - line); const score = d * 1000 + c; if (score < bd) { bd = score; best = i; } });
      if (best !== cur_.current) { cur_.current = best; setA(best); }
    };
    const ask = () => { if (live && !raf) raf = requestAnimationFrame(measure); };
    const io = new IntersectionObserver(([e]) => { live = e.isIntersecting; ask(); }, { rootMargin: "20% 0px 20% 0px" });
    const box = rows.current[0]?.parentElement; if (box) io.observe(box);
    addEventListener("scroll", ask, { passive: true }); addEventListener("resize", ask);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("scroll", ask); removeEventListener("resize", ask); };
  }, []);
  const pick = (i) => { lock.current = Date.now() + 700; cur_.current = i; setA(i); }; // a deliberate click wins over the scroll for a moment
  return (
    <section id="food" className="sec lampbg">
      <div className="wrap">
        <Head n="06" label="Food" lede="From temple prasada and familiar tiffin favourites to seasonal home cooking and the day’s catch, Udupi’s food reflects the many communities and landscapes of the coast.">Flavours of <b>the coast</b></Head>
        <div className="food">
          <ol className="dishes">
            {FOOD.map(([t, d, when, find, id, fb], i) => (
              <li key={t} ref={(el) => { rows.current[i] = el; }} className={a === i ? "on" : ""}>
                <button onClick={() => pick(i)} onFocus={(e) => e.currentTarget.matches(":focus-visible") && pick(i)} aria-current={a === i}>
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  <span><h3>{t}</h3><small className="fs">{when}</small><p>{d}</p><p className="fl"><b>Look for it:</b> {find}</p></span>
                </button>
                <div className="fimg"><Photo id={id} fallback={fb} kind="food" alt={t} /></div>
              </li>))}
          </ol>
          <aside className="duo" aria-hidden="true">
            <div className="pimg">
              {FOOD.map((f, i) => <div key={f[4]} className={"pfill" + (i === a ? " on" : "")}><Photo id={f[4]} fallback={f[5]} kind="food" alt="" priority={Math.abs(i - a) <= 1} /></div>)}
              <div className="dcap"><span>{String(a + 1).padStart(2, "0")} / {String(FOOD.length).padStart(2, "0")}</span><b>{cur[0]}</b></div>
            </div>
            <div className="dtick">{FOOD.map((f, i) => <i key={f[0]} className={i === a ? "on" : ""} />)}</div>
          </aside>
        </div>
        <h3 className="sub">The Udupi classics</h3>
        <ul className="classics">{CLASSICS.map(([t, d, id]) => <li key={t}><div className="cimg"><Photo id={id} kind="food" alt={t} /></div><b>{t}</b><p>{d}</p></li>)}</ul>
        <div className="ffpromo">
          <div className="fft">
            <h3>Bring the flavours home</h3>
            <p>Explore recipes and create your own versions of regional favourites with FLAVORFUSION.AI.</p>
          </div>
          <a className="ffl" href="https://flavorfusion-ai.vercel.app/" target="_blank" rel="noopener noreferrer" aria-label="Open FLAVORFUSION.AI in a new tab">
            <img src="/img/flavorfusion-logo.png" alt="FLAVORFUSION.AI" width="720" height="93" loading="lazy" decoding="async" />
          </a>
        </div>
      </div>
    </section>
  );
}

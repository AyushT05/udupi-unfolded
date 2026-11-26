"use client";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Head from "./Head";
import Photo from "./Photo";
import useLive from "./useLive";
import { MONTHS, FEST, ARTS } from "../lib/data";
const URL = "https://api.open-meteo.com/v1/forecast?latitude=13.34&longitude=74.74&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=5&timezone=Asia%2FKolkata";
const day = (s) => new Date(s + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
export function When() {
  const [w, setW] = useState(undefined);
  useEffect(() => { fetch(URL).then((r) => r.json()).then(setW).catch(() => setW(null)); }, []);
  const rainy = w?.daily?.precipitation_sum?.filter((x) => x >= 5).length || 0;
  return (
    <section id="when" className="sec sand">
      <div className="wrap">
        <Head n="10" label="When to go" lede="October to March is generally the most comfortable season for exploring the coast. The southwest monsoon transforms the landscape from June to September, but heavy rain and rough seas can affect beach visits and island crossings.">The seasons of <b>Udupi</b></Head>
        <div className="months" role="img" aria-label="Relative suitability by month. Best December to April, shoulder in October and November, monsoon June to September.">
          {MONTHS.map(([m, h], i) => <motion.div key={m} initial={{ height: 0 }} whileInView={{ height: h * 10 + "%" }} viewport={{ once: true }} transition={{ duration: 1.1, delay: i * 0.05, ease: [0.2, 0.7, 0.2, 1] }} className={h >= 8 ? "b" : h <= 3 ? "r" : ""}><span>{m}</span></motion.div>)}
        </div>
        <div className="legend"><span><i className="b" />Best</span><span><i />Shoulder</span><span><i className="r" />Monsoon</span></div>
        <h3 className="sub">The days ahead</h3>
        {w === undefined && <p className="lede">Loading the forecast.</p>}
        {w === null && <p className="lede">The live forecast is unavailable at the moment. The seasonal guide above can help with broader planning.</p>}
        {w?.daily && <>
          <p className="lede nm">Now {w.current.temperature_2m}°C in Udupi.{rainy ? ` Rain of 5 mm or more is forecast on ${rainy} of the next 5 days, so keep temple and heritage stops handy.` : ""}</p>
          <div className="wx">{w.daily.time.map((d, i) => <div key={d}><b>{day(d)}</b><span>{Math.round(w.daily.temperature_2m_max[i])}° <small>/ {Math.round(w.daily.temperature_2m_min[i])}°</small></span><em>{w.daily.precipitation_sum[i]} mm rain</em></div>)}</div></>}
      </div>
    </section>
  );
}
const MN = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const EZ = [0.23, 1, 0.32, 1];
function Frame({ id, fb, kind = "temple", alt, parallax = true }) {
  const [ref, live] = useLive(), r2 = useRef(null), { scrollYProgress: p } = useScroll({ target: r2, offset: ["start end", "end start"] }), y = useTransform(p, [0, 1], ["-7%", "7%"]);
  // The frame opens like a curtain from its bottom edge once, then the photograph drifts against the frame as you scroll while it slowly zooms.
  return (
    <motion.div className={"fph" + (id === "fest-anegudde-v2" ? " fph-wide" : "")} ref={(n) => { ref.current = n; r2.current = n; }} data-live={live} initial={{ clipPath: "inset(100% 0 0 0)" }} whileInView={{ clipPath: "inset(0% 0 0 0)" }} viewport={{ once: true, margin: "0px 0px -14% 0px" }} transition={{ duration: 1.5, ease: EZ }}>
      <motion.div className={"fpar" + (parallax ? "" : " still")} style={{ y: parallax ? y : 0 }}><Photo id={id} fallback={fb} kind={kind} alt={alt} /></motion.div>
    </motion.div>
  );
}
const tx = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EZ } } };
const Pin = () => <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 14s5-4.2 5-8a5 5 0 10-10 0c0 3.8 5 8 5 8z" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="8" cy="6" r="1.7" fill="currentColor" /></svg>;
const stag = { hidden: {}, show: { transition: { staggerChildren: 0.11, delayChildren: 0.35 } } };
// One festival or art form: framed photograph on one side; on the other the name, when and where, the story, what to look for and a practical note.
function Entry({ e, i, kind, fb, photo, label, meta }) {
  return (
    <motion.article className={"fev" + (i % 2 ? " r" : "")} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -14% 0px" }} variants={stag}>
      <Frame id={photo} fb={fb} kind={kind} alt={e.t} parallax={photo !== "fest-anegudde-v2"} />
      <div className="ftx"><motion.span className="n" variants={tx}>{String(i + 1).padStart(2, "0")}</motion.span><motion.h3 variants={tx}>{e.t}</motion.h3>
        <motion.p className="fwhen" variants={tx}>{label}</motion.p>
        {meta && <motion.p className="fat" variants={tx}><Pin />{meta}</motion.p>}
        {e.d.map((t, k) => <motion.p key={k} variants={tx}>{t}</motion.p>)}
        <motion.div className="fsee" variants={tx}><b>Look for</b><ul>{e.see.map((s) => <li key={s}>{s}</li>)}</ul></motion.div>
        <motion.p className="fnote" variants={tx}>{e.note}</motion.p></div>
    </motion.article>
  );
}
export function Festivals() {
  const [m, setM] = useState(-1), yr = useRef(null), grow = useInView(yr, { once: true, margin: "0px 0px -15% 0px" });
  useEffect(() => setM(new Date().getMonth()), []);
  return (
    <section id="festivals" className="sec ink">
      <div className="wrap">
        <Head n="11" label="Festivals" lede="Udupi’s calendar moves with temple traditions, harvest rhythms and the lunar year. These are some of the district’s most distinctive celebrations; annual dates vary, so plan around the published calendar for the year of your visit.">The year, <b>in festivals</b></Head>
        <div className="yrs"><div className={"yr" + (grow ? " go" : "")} ref={yr} style={{ "--m": m }} role="img" aria-label="Months in which each festival usually falls">
          {m >= 0 && <i className="now" />}
          <div className="yrow yh"><span />{MN.map((c, k) => <b key={k} className={k === m ? "cur" : ""}>{c}</b>)}</div>
          {FEST.map((e, ri) => <div className="yrow" key={e.id} style={{ "--d": ri * 0.09 + "s" }}><span>{e.s}</span>{e.spans.map(([a, b], k) => <em key={k} style={{ gridColumn: `${a + 2} / ${b + 3}` }} />)}</div>)}
        </div></div>
        <div className="fevs">{FEST.map((e, i) => <Entry key={e.id} e={e} i={i} kind="temple" photo={e.id} fb={e.fb} label={e.when} meta={e.at} />)}</div>
      </div>
    </section>
  );
}
// Traditional art forms and living cultures. They are not festivals: they follow their own seasons and are not guaranteed on a given day.
export function Traditions() {
  return (
    <section id="traditions" className="sec lampbg trad">
      <div className="wrap">
        <Head n="12" label="Traditions" lede="The cultural life of coastal Karnataka extends well beyond its festival calendar. These performance traditions and sacred practices are rooted in village communities, temple grounds and seasonal gatherings.">Art forms of <b>the coast</b></Head>
        <div className="fevs">{ARTS.map((e, i) => <Entry key={e.id} e={e} i={i} kind="culture" photo={e.photo} label={e.season} />)}</div>
      </div>
    </section>
  );
}

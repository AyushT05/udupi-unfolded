"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FOOD, FEST, MONTHS } from "../lib/data";
const rv = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-10%" }, transition: { duration: 0.9, ease: [0.2, 0.7, 0.2, 1] } };
export function Discover() {
  return (<section className="sec l"><h2 className="big">A coast that <b>feeds</b> you first.</h2><div className="dis">
    <motion.p {...rv}>Udupi is a pilgrimage town whose <b>Krishna Matha</b> serves thousands of meals a day, and whose kitchens taught India what a dosa could be.</motion.p>
    <motion.p {...rv}>Fifteen minutes west, <b>Malpe</b>’s harbour fills with boats at dusk, and a short ferry ride away the St Mary’s Islands rise as columns of dark stone.</motion.p>
    <motion.p {...rv}>Drive north and the coast loosens: river mouths at <b>Kodi</b>, a highway squeezed between sea and river at <b>Maravanthe</b>.</motion.p>
    <motion.p {...rv}>Come between <b>December and April</b>. In the monsoon the sea closes, the island ferry stops, and the town goes quiet.</motion.p></div></section>);
}
export function Food() {
  return (<section id="food" className="sec y"><h2 className="big">Eat like <b>a local</b></h2><p className="lede dk">We name dishes, not restaurants, because we can’t verify listings or ratings here.</p>
    <div className="fd">{FOOD.map(([t, d]) => <motion.div key={t} {...rv}><h3>{t}</h3><p>{d}</p></motion.div>)}</div></section>);
}
export function Weather() {
  const [w, setW] = useState(null);
  useEffect(() => { fetch("https://api.open-meteo.com/v1/forecast?latitude=13.34&longitude=74.74&current=temperature_2m&daily=temperature_2m_max,precipitation_sum&forecast_days=5&timezone=Asia%2FKolkata").then((r) => r.json()).then(setW).catch(() => {}); }, []);
  return (<section id="when" className="sec d"><h2 className="big">When to <b>go</b></h2>
    <p className="lede">Heavy rain from June to September; island boats are suspended by the district administration roughly May to September, and dates vary. The chart is a qualitative seasonal guide.</p>
    <div className="ssn" role="img" aria-label="Relative suitability by month. Best December to April, shoulder in October and November, monsoon June to September.">{MONTHS.map(([m, h], i) => <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: h * 10 + "%" }} viewport={{ once: true }} transition={{ duration: 1.2, delay: i * 0.05 }} className={h >= 8 ? "b" : h <= 3 ? "r" : ""}><span>{m}</span></motion.div>)}</div>
    <div className="wx"><h3>{w?.current ? "Live forecast (Open-Meteo)" : "Live forecast unavailable"}</h3>{w?.current && <p>Now {w.current.temperature_2m}°C. {w.daily.time.map((d, i) => `${d.slice(5)}: ${w.daily.temperature_2m_max[i]}°C, ${w.daily.precipitation_sum[i]} mm`).join(" · ")}</p>}</div></section>);
}
export function Festivals() {
  return (<section className="sec l"><h2 className="big">Festivals &amp; <b>seasons</b></h2><div className="tl">{FEST.map(([t, d]) => <motion.div key={t} {...rv}><h3>{t}</h3><p>{d}</p></motion.div>)}</div></section>);
}
export function Practical() {
  const I = [["Rail", "Udupi station is on the Konkan Railway line."], ["Air", "Mangaluru International Airport is the nearest major airport."], ["Road", "The coastal highway, NH66, runs through the district. Auto-rickshaws and taxis connect Udupi town to Malpe."], ["Pack", "Light cotton, sun protection, sandals for rocky shores, a rain layer outside Dec–Apr."]];
  return (<section id="help" className="sec d"><h2 className="big">Getting <b>there</b></h2><div className="inf">{I.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
    <p className="sos">112<small>India’s emergency number. Police 100 · Ambulance 108. Large hospitals in the area include those in Udupi town and Manipal. Verify contacts locally.</small></p></section>);
}
export function Footer() { return <footer>Udupi, unhurried is an independent guide concept. Confirm fees, timings and ferry operation locally. Coordinates are approximate. Set in Allo. Photos added with the photos script come from Wikimedia Commons under their own licences; credits show in the gallery.</footer>; }

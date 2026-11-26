"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Photo from "./Photo";
const TEXT = "Where the Western Ghats descend towards the Arabian Sea, Udupi brings together centuries-old temple traditions, a working fishing coast and a cuisine recognised far beyond Karnataka.";
const INTRO = [
  "Udupi is the headquarters of a coastal district shaped by the cultures of Tulu Nadu. The town’s spiritual heart is Sri Krishna Matha, established in the thirteenth century by the philosopher Madhvacharya. Its administration and worship are shared by eight monasteries, the Ashta Mathas, which take turns in a biennial tradition known as Paryaya. Tulu is widely spoken across the district, alongside Kannada and Konkani.",
  "The town gave its name to one of India’s best-known vegetarian food traditions. Udupi kitchens helped popularise crisp dosas, idli, sambar and balanced South Indian meals across the country. The district’s culinary identity is broader still: neer dosa, seasonal jackfruit and colocasia preparations, Mattu gulla brinjal, coconut-rich curries and the seafood culture of Malpe all belong to the same coast.",
  "Beyond the temple town, the coastline moves through fishing harbours, river estuaries, lighthouse headlands and long beaches. Inland, the landscape rises towards the Western Ghats, where hill shrines and the Jain heritage of Karkala offer a different perspective on the district. October to March is generally the most comfortable period for coastal travel; the southwest monsoon, from June into September, brings intense rain, dramatic seas and a seasonal pause in island ferry services.",
];
function Word({ w, i, n, p }) {
  const a = (i / n) * 0.7, o = useTransform(p, [a, a + 0.12], [0.16, 1]);
  return <motion.span style={{ opacity: o }}>{w} </motion.span>;
}
function Pillar({ id, fb, kind, title, text, dy }) {
  const ref = useRef(null), { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] }), y = useTransform(p, [0, 1], [dy, -dy]);
  return (<figure ref={ref} className="pil"><motion.div className="pclip" initial={{ clipPath: "inset(100% 0 0 0)" }} whileInView={{ clipPath: "inset(0% 0 0 0)" }} viewport={{ once: true, margin: "0px 0px -12% 0px" }} transition={{ duration: 1.3, ease: [0.23, 1, 0.32, 1] }}><motion.div style={{ y }} className="pilimg"><Photo id={id} fallback={fb} kind={kind} alt={title} /></motion.div></motion.div><figcaption><b>{title}</b>{text}</figcaption></figure>);
}
export default function Discover() {
  const ref = useRef(null), { scrollYProgress: p } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] }), words = TEXT.split(" ");
  return (
    <section id="discover" className="sec sand">
      <div className="wrap">
        <p className="eb">01 · Discover</p>
        <p ref={ref} className="statement" aria-label={TEXT}>{words.map((w, i) => <Word key={i} w={w} i={i} n={words.length} p={p} />)}</p>
        <div className="intro">{INTRO.map((t) => <p key={t.slice(0, 12)}>{t}</p>)}</div>
        <div className="pils">
          <Pillar id="discover-1" fb="matha" kind="temple" dy={22} title="A living tradition" text="The Ashta Mathas sustain the worship at Sri Krishna Matha through a two-year rotation. Around the temple, Car Street, Madhva Sarovara and the older Anantheshwara shrine form a remarkable historic precinct." />
          <Pillar id="discover-2" fb="malpe" kind="beach" dy={34} title="A working coast" text="Malpe’s fishing harbour sets the rhythm of the shore, while beaches at Kodi, Kaup and Mattu reveal a changing coastline of open sand, rocky headlands and quiet village roads." />
          <Pillar id="discover-3" fb="stm" kind="island" dy={26} title="Land and memory" text="Off Malpe, the basalt columns of St Mary’s Islands preserve a rare geological story. Inland, Kunjarugiri, Pajaka and Karkala bring together sacred landscapes, Jain architecture and centuries of regional history." />
        </div>
        <dl className="facts">
          <div><dt>Coastal season</dt><dd>October to March</dd></div>
          <div><dt>Monsoon</dt><dd>June to September</dd></div>
          <div><dt>Emergency</dt><dd>112</dd></div>
        </dl>
      </div>
    </section>
  );
}

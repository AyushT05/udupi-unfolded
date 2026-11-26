"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Photo from "./Photo";
import Head from "./Head";
import { kindOf } from "./Scene";
import { AREAS, STAYTYPES, byId } from "../lib/data";

const q = (s) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("hotels near " + s);

export default function Stay() {
  const [a, setA] = useState(0);
  const [n, d, s, id] = [AREAS[a][0], AREAS[a][2], AREAS[a][3], AREAS[a][1]];

  return (
    <section id="stay" className="sec ink">
      <div className="wrap">
        <Head n="07" label="Stay" lede="Choose your base around the kind of trip you have in mind: temple visits and food in town, island crossings at Malpe, or a quieter stretch of coast.">Find your <b>base</b></Head>
        <div className="stay">
          <div className="areas" role="tablist" aria-label="Choose your area">
            {AREAS.map(([t], i) => (
              <button
                key={t}
                id={`stay-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={a === i}
                aria-controls="stay-panel"
                className={a === i ? "on" : ""}
                onClick={() => setA(i)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="apanel" id="stay-panel" role="tabpanel" aria-labelledby={`stay-tab-${a}`}>
            <div className="pimg wide stay-photo">
              <AnimatePresence initial={false} mode="sync">
                <motion.div
                  key={a}
                  className="pfill"
                  initial={{ opacity: 0, scale: 1.025 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <Photo
                    id={`stay-${a + 1}`}
                    fallback={id}
                    kind={kindOf(byId(id).c)}
                    alt={`A stay in ${n}, Udupi district`}
                    priority={a === 0}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="astory">
              <p>{d}</p>
              <a className="btn" href={q(s)} target="_blank" rel="noopener noreferrer">
                Browse stays near {s}
              </a>
            </div>
          </div>
        </div>
        <h3 className="sub">Choosing your stay</h3>
        <div className="types">
          {STAYTYPES.map(([t, x]) => (
            <details key={t}>
              <summary>{t}</summary>
              <p>{x}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";
import Head from "./Head";
import { INFO } from "../lib/data";
export function Practical() {
  return (
    <section id="help" className="sec sand">
      <div className="wrap">
        <Head n="15" label="Travel information">Arriving in <b>Udupi</b></Head>
        <div className="info">{INFO.map(([t, d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
        <div className="sos"><b>112</b><p>India’s unified emergency response number. For medical assistance, Udupi town and Manipal have major hospitals and emergency-care facilities.</p></div>
      </div>
    </section>
  );
}

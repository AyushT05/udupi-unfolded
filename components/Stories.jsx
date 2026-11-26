"use client";
import { useEffect, useState } from "react";
import Head from "./Head";
import Aurora from "./Aurora";
export default function Stories() {
  const [list, setList] = useState([]), [n, setN] = useState(""), [r, setR] = useState(5), [t, setT] = useState("");
  useEffect(() => { try { setList(JSON.parse(localStorage.getItem("udupi_reviews") || "[]")); } catch {} }, []);
  const add = (e) => { e.preventDefault(); if (!t.trim()) return; const x = [{ n: n.trim().slice(0, 40) || "Traveller", r, t: t.trim().slice(0, 600) }, ...list]; setList(x); try { localStorage.setItem("udupi_reviews", JSON.stringify(x)); } catch {} setT(""); };
  return (
    <section id="stories" className="sec ink aur">
      <Aurora />
      <div className="wrap">
        <Head n="14" label="Stories" lede="Add a personal perspective to the guide. Share a place, a meal or a moment that stayed with you; your story is saved in this browser.">Notes from the <b>road</b></Head>
        <div className="stories">
          <form className="sform" onSubmit={add}>
            <label className="fld"><span>Name</span><input placeholder="Optional" value={n} onChange={(e) => setN(e.target.value)} maxLength={40} /></label>
            <div className="fld"><span id="rl">Rating</span><div className="rate" role="radiogroup" aria-labelledby="rl">{[1, 2, 3, 4, 5].map((k) => <button type="button" key={k} role="radio" aria-checked={r === k} aria-label={`${k} of 5`} className={k <= r ? "on" : ""} onClick={() => setR(k)}>★</button>)}</div></div>
            <label className="fld"><span>Your story</span><textarea rows={5} placeholder="Share a place, detail or experience worth passing on." value={t} onChange={(e) => setT(e.target.value)} maxLength={600} /></label>
            <button className="btn">Save story</button>
          </form>
          <div className="slist" aria-live="polite">{list.length ? list.map((x, i) => <article className="it" key={i}><span className="stars" aria-label={`${x.r} out of 5`}>{"★".repeat(x.r)}<s>{"★".repeat(5 - x.r)}</s></span><p>{x.t}</p><strong>{x.n}</strong></article>) : <p className="empty">The first story is waiting to be told.</p>}</div>
        </div>
      </div>
    </section>
  );
}

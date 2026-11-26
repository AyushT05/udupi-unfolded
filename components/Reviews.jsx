"use client";
import { useEffect, useState } from "react";
export default function Reviews() {
  const [list, setList] = useState([]), [n, setN] = useState(""), [r, setR] = useState(5), [t, setT] = useState("");
  useEffect(() => { try { setList(JSON.parse(localStorage.getItem("udupi_reviews") || "[]")); } catch {} }, []);
  const add = (e) => { e.preventDefault(); if (!t.trim()) return; const x = [{ n: n.trim().slice(0, 40) || "Traveller", r, t: t.trim().slice(0, 600) }, ...list]; setList(x); try { localStorage.setItem("udupi_reviews", JSON.stringify(x)); } catch {} setT(""); };
  return (<section id="stories" className="sec d2"><h2 className="big">Traveller <b>stories</b></h2>
    <p className="lede">Stories are saved in this browser only. Sharing them between visitors needs a backend (see the README).</p>
    <form onSubmit={add}><input aria-label="Your name" placeholder="Name (optional)" value={n} onChange={(e) => setN(e.target.value)} maxLength={40} />
      <select aria-label="Rating" value={r} onChange={(e) => setR(+e.target.value)}>{[5, 4, 3, 2, 1].map((k) => <option key={k} value={k}>{k} of 5</option>)}</select>
      <textarea aria-label="Your story" rows={3} placeholder="What should the next traveller know?" value={t} onChange={(e) => setT(e.target.value)} maxLength={600} /><button className="btn">Save story</button></form>
    <div aria-live="polite">{list.length ? list.map((x, i) => <div className="it" key={i}><span className="stars" aria-label={x.r + " out of 5"}>{"★".repeat(x.r)}{"☆".repeat(5 - x.r)}</span> <strong>{x.n}</strong><p>{x.t}</p></div>) : <p className="lede">No stories yet. Add the first one.</p>}</div></section>);
}

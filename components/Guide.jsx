"use client";
import { useEffect, useRef, useState } from "react";
import Head from "./Head";
import Aurora from "./Aurora";
import { ask } from "../lib/assistant";
import { sfx } from "../lib/sfx";
const HELLO = { role: "assistant", content: "Welcome. I can help shape an itinerary, compare places, explore Udupi’s food and traditions, estimate journey distances or suggest alternatives for a rainy day." };
const START = ["Plan 2 days with sunsets and good food", "What if it rains?", "Discover places beyond the usual route", "How far is Malpe from Manipal?", "With elderly parents", "What should I eat?"];
const AFTER = ["Make it a day longer", "Keep it easier", "What about rain?", "Where should we eat?", "Best time to visit?"];
// Tiny, safe markdown: **bold**, [text](https://link), "-" bullets and numbered lists. Everything is rendered as React nodes, never as raw HTML.
const inline = (s) => s.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g).map((t, i) => {
  if (/^\*\*[^*]+\*\*$/.test(t)) return <b key={i}>{t.slice(2, -2)}</b>;
  const l = t.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/); if (l) return <a key={i} href={l[2]} target="_blank" rel="noopener noreferrer">{l[1]}</a>;
  return t;
});
function Md({ text }) {
  const out = []; let list = null;
  const flush = () => { if (list) { const T = list.t; out.push(<T key={out.length}>{list.items.map((x, i) => <li key={i}>{inline(x)}</li>)}</T>); list = null; } };
  for (const raw of text.split("\n")) {
    const b = raw.match(/^\s*[-*•]\s+(.*)/), n = raw.match(/^\s*\d+[.)]\s+(.*)/);
    if (b || n) { const t = b ? "ul" : "ol"; if (!list || list.t !== t) { flush(); list = { t, items: [] }; } list.items.push((b || n)[1]); }
    else { flush(); if (raw.trim()) out.push(<p key={out.length}>{inline(raw.trim())}</p>); }
  }
  flush(); return out;
}
export default function Guide() {
  const [log, setLog] = useState([HELLO]), [v, setV] = useState(""), [busy, setBusy] = useState(false), end = useRef(null), ctl = useRef(null), sticky = useRef(true);
  useEffect(() => { const el = end.current; if (el && sticky.current) el.scrollTo({ top: el.scrollHeight, behavior: busy ? "auto" : "smooth" }); }, [log, busy]);
  const say = async (t) => {
    t = t.trim(); if (busy || !t) return; setBusy(true); sfx("guide-send"); sticky.current = true;
    const next = [...log, { role: "user", content: t }]; setLog([...next, { role: "assistant", content: "" }]);
    const c = (ctl.current = new AbortController());
    const r = await ask(next, (x) => setLog([...next, { role: "assistant", content: x }]), c.signal).catch(() => ({ text: "", aborted: false }));
    if (!r.text) setLog([...next, { role: "assistant", content: r.aborted ? "Stopped." : "Sorry, I could not answer that just now. Please try again." }]);
    setBusy(false); if (!r.aborted && r.text) sfx("guide-reply");
  };
  const stop = () => ctl.current?.abort();
  const reset = () => { ctl.current?.abort(); setLog([HELLO]); setBusy(false); };
  const chips = log.length > 1 ? AFTER : START;
  return (
    <section id="guide" className="sec ink aur gsec">
      <Aurora />
      <div className="wrap">
        <Head n="09" label="Guide" lede="Explore the district with a local lens. Ask about places, routes, food, festivals and the details that make each stop worth your time.">Your guide to <b>Udupi</b></Head>
        <div className="chat">
          <div className="log" ref={end} role="log" aria-live="polite" data-lenis-prevent onScroll={(e) => { const el = e.currentTarget; sticky.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}>
            {log.map((m, i) => <div key={i} className={"m " + (m.role === "user" ? "u" : "a")}>{m.role === "user" ? m.content : m.content ? <Md text={m.content} /> : <span className="dots" aria-label="Thinking"><i /><i /><i /></span>}</div>)}
          </div>
          <div className="gbar">
            <div className="chips sug">{chips.map((t) => <button key={t} className="chip" disabled={busy} onClick={() => say(t)}>{t}</button>)}</div>
            {log.length > 1 && <button className="gnew" onClick={reset}>New chat</button>}
          </div>
          <form className="cf" onSubmit={(e) => { e.preventDefault(); if (busy) return; say(v); setV(""); }}>
            <input aria-label="Your question" value={v} onChange={(e) => setV(e.target.value)} placeholder="Build a two-day coastal itinerary" maxLength={400} enterKeyHint="send" autoComplete="off" />
            {busy ? <button type="button" className="btn" onClick={stop}>Stop</button> : <button className="btn" disabled={!v.trim()}>Ask</button>}
          </form>
        </div>
      </div>
    </section>
  );
}

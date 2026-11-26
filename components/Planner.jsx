"use client";
import { useEffect, useRef, useState } from "react";
import { Reorder } from "framer-motion";
import Head from "./Head";
import { P, CT, HUBS, km, byId, routeUrl } from "../lib/data";
import { buildPlan as build } from "../lib/plan";
const INTERESTS = ["beach", "temple", "heritage", "nature", "island"];
const Seg = ({ v, set, opts }) => <div className="seg" role="group">{opts.map(([k, l]) => <button key={k} aria-pressed={v === k} onClick={() => set(k)}>{l}</button>)}</div>;
export default function Planner() {
  const [days, setDays] = useState(2), [pace, setPace] = useState(3), [w, setW] = useState(["beach", "temple", "heritage", "nature"]), [eld, setEld] = useState(false), [hubId, setHub] = useState("udupi"), [trip, setTrip] = useState([]), [msg, setMsg] = useState("");
  const skip = useRef(false), hub = HUBS.find((h) => h.id === hubId);
  useEffect(() => { // restore a shared plan from the URL hash
    const m = location.hash.match(/^#plan=(.*)$/);
    if (m) { const t = m[1].split("~").map((d) => d.split(".").filter(byId)).filter((d) => d.length); if (t.length) { skip.current = true; setTrip(t); setDays(t.length); } }
  }, []);
  useEffect(() => { if (skip.current) { skip.current = false; return; } setTrip(build({ days, pace, w, eld, hub })); }, [days, pace, w, eld, hubId]); // eslint-disable-line
  const set = (i, d) => setTrip(trip.map((x, k) => (k === i ? d : x)));
  const move = (i, j, dir) => { const d = [...trip[i]], k = j + dir; if (k < 0 || k >= d.length) return; [d[j], d[k]] = [d[k], d[j]]; set(i, d); };
  const share = () => { const u = location.origin + location.pathname + "#plan=" + trip.map((d) => d.join(".")).join("~"); navigator.clipboard?.writeText(u).then(() => setMsg("Link copied"), () => setMsg("Copy failed")); setTimeout(() => setMsg(""), 2500); };
  const used = trip.flat();
  return (
    <section id="plan" className="sec sand">
      <div className="wrap">
        <Head n="08" label="Plan" lede="Build a route around your time, interests and preferred pace. The suggested days follow the geography of the coast; rearrange the stops to make the itinerary your own.">Build your <b>days</b></Head>
        <div className="plan">
          <div className="ctl">
            <fieldset><legend>Days</legend><Seg v={days} set={setDays} opts={[[1, "1"], [2, "2"], [3, "3"], [4, "4"]]} /></fieldset>
            <fieldset><legend>Pace</legend><Seg v={pace} set={setPace} opts={[[2, "Relaxed"], [3, "Balanced"], [4, "Packed"]]} /></fieldset>
            <fieldset><legend>Base</legend><Seg v={hubId} set={setHub} opts={HUBS.map((h) => [h.id, h.n])} /></fieldset>
            <fieldset><legend>Interests</legend><div className="chips">{INTERESTS.map((k) => <button key={k} className="chip" aria-pressed={w.includes(k)} onClick={() => setW(w.includes(k) ? w.filter((x) => x !== k) : [...w, k])}>{CT[k]}</button>)}</div></fieldset>
            <div className="chips"><button className="chip" aria-pressed={eld} onClick={() => setEld(!eld)}>A gentler route</button></div>
            {eld && <p className="note">The itinerary favours easier-access stops and leaves out rocky or weather-dependent locations.</p>}
          </div>
          <div className="days" aria-live="polite">
            {trip.length === 0 && <p className="lede">Choose an interest to begin building your itinerary.</p>}
            {trip.map((d, i) => {
              const dist = d.slice(1).reduce((s, id, j) => s + km(byId(d[j]), byId(id)), 0);
              return (
                <div className="day" key={i}>
                  <div className="dh"><h3>Day {i + 1}</h3><span>{d.length} stops · about {dist.toFixed(0)} km between them (straight-line)</span></div>
                  <Reorder.Group axis="y" values={d} onReorder={(v) => set(i, v)} className="stops">
                    {d.map((id, j) => { const p = byId(id); return (
                      <Reorder.Item key={id} value={id} className="stop">
                        <span className="grip" aria-hidden="true">⋮⋮</span><span className="sn">{j + 1}</span><span className="nm">{p.n}<small>{CT[p.c]}</small></span>
                        <span className="sb"><button aria-label={`Move ${p.n} up`} onClick={() => move(i, j, -1)}>Up</button><button aria-label={`Move ${p.n} down`} onClick={() => move(i, j, 1)}>Down</button><button aria-label={`Remove ${p.n}`} onClick={() => set(i, d.filter((x) => x !== id))}>Remove</button></span>
                      </Reorder.Item>); })}
                  </Reorder.Group>
                  <div className="dfoot">
                    <select aria-label={`Add another stop to day ${i + 1}`} value="" onChange={(e) => e.target.value && set(i, [...d, e.target.value])}><option value="">Add another stop</option>{P.filter((p) => !used.includes(p.id)).map((p) => <option key={p.id} value={p.id}>{p.n}</option>)}</select>
                    {d.length > 1 && <a className="lnk" href={routeUrl(d.map(byId))} target="_blank" rel="noopener">Open route in Maps</a>}
                  </div>
                </div>);
            })}
            {trip.length > 0 && <div className="pact"><button className="btn solid-ink" onClick={share}>Share this itinerary</button><span aria-live="polite">{msg}</span></div>}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { P, CT, maps } from "../lib/data";
export default function Map() {
  const el = useRef(null), mp = useRef(null), grp = useRef(null), [f, setF] = useState("all"), [L, setL] = useState(null);
  useEffect(() => {
    let dead = false;
    import("leaflet").then(({ default: lf }) => {
      if (dead || mp.current) return;
      const m = lf.map(el.current, { scrollWheelZoom: false }).setView([13.45, 74.7], 10);
      lf.tileLayer(process.env.NEXT_PUBLIC_MAP_TILES || "https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(m);
      mp.current = m; grp.current = lf.layerGroup().addTo(m); setL(lf);
    });
    return () => { dead = true; mp.current?.remove(); mp.current = null; };
  }, []);
  useEffect(() => {
    if (!L) return; grp.current.clearLayers();
    P.filter((p) => f == "all" || p.c == f || (f == "gem" && p.g)).forEach((p) => L.circleMarker([p.la, p.ln], { radius: 9, color: "#0b2f3a", weight: 2, fillColor: p.g ? "#b4492f" : "#f4b63f", fillOpacity: 1 })
      .bindPopup(`<strong>${p.n}</strong><br>${CT[p.c]}<br><a href="${maps(p)}" target="_blank" rel="noopener">Directions</a>`).addTo(grp.current));
  }, [L, f]);
  return (
    <section id="map" className="sec l"><h2 className="big">The coast, <b>north to south</b></h2><p className="lede">Marker positions are approximate. Open a marker for directions in your own maps app.</p>
      <div className="bar" role="group" aria-label="Filter map">{[["all", "All"], ...Object.entries(CT), ["gem", "Hidden gems"]].map(([k, l]) => <button key={k} className="chip" aria-pressed={f == k} onClick={() => setF(k)}>{l}</button>)}</div>
      <div ref={el} className="mapbox" role="application" aria-label="Map of places in Udupi" /></section>
  );
}

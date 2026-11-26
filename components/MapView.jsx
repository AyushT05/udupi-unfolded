"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import Head from "./Head";
import { P, CT, maps, dirs } from "../lib/data";
const TILES = process.env.NEXT_PUBLIC_MAP_TILES || "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const FILTERS = [["all", "All"], ...Object.entries(CT), ["gem", "Beyond town"]];
export default function MapView() {
  const el = useRef(null), map = useRef(null), mk = useRef({}), [L, setL] = useState(null), [f, setF] = useState("all"), [sel, setSel] = useState(null);
  const list = P.filter((p) => f === "all" || p.c === f || (f === "gem" && p.g));
  useEffect(() => {
    let dead = false;
    import("leaflet").then(({ default: lf }) => {
      if (dead || map.current) return;
      const m = lf.map(el.current, { scrollWheelZoom: false, zoomControl: false, attributionControl: false }).setView([13.45, 74.72], 10);
      lf.control.zoom({ position: "bottomright" }).addTo(m);
      lf.control.attribution({ prefix: false }).addTo(m);
      lf.tileLayer(TILES, { subdomains: "abcd", maxZoom: 18, attribution: "© OpenStreetMap contributors © CARTO" }).addTo(m);
      m.on("click", () => m.scrollWheelZoom.enable()); m.on("mouseout", () => m.scrollWheelZoom.disable());
      map.current = m; setL(lf);
    });
    return () => { dead = true; map.current?.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    if (!L || !map.current) return;
    Object.values(mk.current).forEach((m) => m.remove()); mk.current = {};
    list.forEach((p) => {
      const m = L.marker([p.la, p.ln], { icon: L.divIcon({ className: "", html: `<span class="mk${p.g ? " g" : ""}"></span>`, iconSize: [16, 16] }), title: p.n, keyboard: true })
        .bindPopup(`<strong>${p.n}</strong><br><small>${CT[p.c]}</small><br><a href="/places/${p.id}">Read more</a> · <a href="${dirs(p)}" target="_blank" rel="noopener">Directions</a>`).addTo(map.current);
      m.on("click", () => setSel(p.id)); mk.current[p.id] = m;
    });
    if (list.length > 1) map.current.fitBounds(list.map((p) => [p.la, p.ln]), { padding: [60, 60], maxZoom: 11 });
  }, [L, f]); // eslint-disable-line
  const go = (p) => { setSel(p.id); map.current?.flyTo([p.la, p.ln], 12, { duration: 1.1 }); mk.current[p.id]?.openPopup(); };
  return (
    <section id="map" className="sec ink">
      <div className="wrap">
        <Head n="04" label="Map" lede="Explore the district from north to south. Select a marker or place name to open its location and directions.">Explore the <b>district</b></Head>
        <div className="chips tools" role="group" aria-label="Filter map">{FILTERS.map(([k, l]) => <button key={k} className="chip" aria-pressed={f === k} onClick={() => { setF(k); setSel(null); }}>{l}</button>)}</div>
        <div className="mapgrid">
          <ul className="mlist" data-lenis-prevent>{[...list].sort((a, b) => b.la - a.la).map((p) => <li key={p.id}><button className={sel === p.id ? "on" : ""} onClick={() => go(p)}><b>{p.n}</b><small>{CT[p.c]}</small></button></li>)}</ul>
          <div ref={el} className="mapbox" data-lenis-prevent role="application" aria-label="Map of places in Udupi" />
        </div>
        <p className="note">Use the place markers to explore the coast; switch to your preferred maps app for turn-by-turn directions and nearby services.</p>
      </div>
    </section>
  );
}

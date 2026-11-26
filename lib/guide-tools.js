import { P, HUBS, FOOD, CLASSICS, FEST, MONTHS, AREAS, STAYTYPES, INFO, CT, km, byId, lookup } from "./data";
import { DET } from "./details";
import { buildPlan } from "./plan";
// Everything the guide knows how to look up. These are plain functions over the site's own data, used in two places:
//   1. app/api/chat/route.js hands them to the language model as callable tools, so distances, place facts and itineraries are computed, not guessed;
//   2. lib/local.js calls them directly to answer when no model is configured.
const trim = (s, n) => (s && s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s || "");
const canon = (x) => (x && (P.find((p) => p.id === x.id) || x)) || null; // lookup() returns copies; map back to the real entry
const find = (name) => { const t = String(name || "").trim(); if (!t) return null; const low = t.toLowerCase(); return P.find((p) => p.id === low || p.n.toLowerCase() === low) || canon(lookup(t)[0]) || P.find((p) => p.n.toLowerCase().includes(low)) || null; };
const road = (s) => [Math.round(s * 1.15), Math.round(s * 1.4)];
const MON = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const monthIdx = (m) => { const i = MON.indexOf(String(m || "").toLowerCase().slice(0, 3)); return i; };

export function distance({ from, to }) {
  const a = find(from), b = find(to);
  if (!a || !b) return { error: `Could not place ${!a ? `"${from}"` : `"${to}"`}. Known places include: ${P.map((p) => p.n).join(", ")}, Mangaluru, Kundapura, Brahmavar, Byndoor, Kollur, Agumbe.` };
  const s = km(a, b), r = road(s);
  return { from: a.n, to: b.n, straight_line_km: +s.toFixed(1), road_km_estimate: `${r[0]} to ${r[1]}`, drive_time_estimate: `roughly ${Math.max(5, Math.round((r[0] / 40) * 60))} to ${Math.max(10, Math.round((r[1] / 28) * 60))} minutes by car or auto, depending on traffic`, note: "Straight-line is exact for the coordinates; road figures are estimates." };
}
export function place_info({ name }) {
  const p = find(name); if (!p || !P.includes(p)) return { error: `No detailed entry for "${name}". Places with entries: ${P.map((x) => x.n).join(", ")}.` };
  const d = DET[p.id] || {};
  return { name: p.n, category: CT[p.c], hidden_gem: !!p.g, tagline: p.tag, summary: trim(p.d, 700), story: (d.story || []).slice(0, 2).map((x) => trim(x, 420)), things_to_notice: d.see || [], best_time: d.best, time_needed: d.time, how_to_reach: d.reach, pairs_well_with: (d.pair || []).map((id) => byId(id)?.n).filter(Boolean), access_note: p.hard ? "Rocky or weather-dependent access; ferries are seasonal." : undefined };
}
export function list_places({ category, hidden_gem, near, max_km, limit } = {}) {
  const origin = near ? find(near) : null;
  let r = P.filter((p) => (!category || p.c === category) && (hidden_gem === undefined || !!p.g === !!hidden_gem));
  r = r.map((p) => ({ id: p.id, name: p.n, category: p.c, hidden_gem: !!p.g, tagline: p.tag, ...(origin ? { km_from_origin: +km(origin, p).toFixed(1) } : {}) }));
  if (origin) { r = r.filter((p) => p.name !== origin.n && (!max_km || p.km_from_origin <= max_km)).sort((a, b) => a.km_from_origin - b.km_from_origin); }
  return { origin: origin?.n, places: r.slice(0, Math.min(limit || 8, 12)) };
}
export function build_itinerary({ days = 2, interests, pace = 3, base, mobility_friendly, around } = {}) {
  days = Math.max(1, Math.min(5, Math.round(+days || 2))); pace = Math.max(2, Math.min(4, Math.round(+pace || 3)));
  const w = (interests || []).filter((c) => CT[c]); const cats = w.length ? w : ["beach", "temple", "heritage", "nature"];
  const hub = HUBS.find((h) => h.id === String(base || "").toLowerCase()) || HUBS.find((h) => lookup(String(base || ""))[0]?.id === h.id) || HUBS[0];
  const focus = around ? find(around) : null;
  const plan = buildPlan({ days, pace, w: cats, eld: !!mobility_friendly, hub, around: focus && P.includes(focus) ? focus : undefined });
  return {
    base: hub.n, ...(focus ? { built_around: focus.n } : {}),
    days: plan.map((d, i) => ({ day: i + 1, stops: d.map((id, k) => { const p = byId(id), prev = k ? byId(d[k - 1]) : hub, x = DET[id] || {}; return { name: p.n, category: CT[p.c], tagline: p.tag, km_from_previous: +km(prev, p).toFixed(1), time_needed: x.time, best_time: x.best, hidden_gem: !!p.g }; }) })),
    notes: ["Stops are grouped by position along the coast and ordered to avoid backtracking; the ferry to St Mary's goes first and Malpe is saved for sunset.", "km_from_previous is straight-line; roads are roughly 15 to 40 percent longer."],
  };
}
export function season_advice({ month } = {}) {
  const i = monthIdx(month);
  if (i < 0) return { scores_out_of_10: Object.fromEntries(MONTHS), best: "December to April (cool, dry, easy sea).", shoulder: "October and November (post-monsoon, greener, some showers) and May (hot and humid).", avoid: "June to September: heavy monsoon rain, rough sea, island ferries suspended. Green and cheap, but plan for indoor stops (Krishna Matha, Anantheshwara, Hasta Shilpa)." };
  const [n, sc] = MONTHS[i];
  return { month: n, comfort_score_out_of_10: sc, summary: sc >= 8 ? "Excellent time to visit: dry and pleasant." : sc >= 5 ? "Decent; expect heat, humidity or the odd shower." : "Monsoon: heavy rain, rough sea, island ferries suspended.", festivals_this_month: festivals({ month }).festivals };
}
export function festivals({ month } = {}) {
  const i = monthIdx(month), names = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  let r = FEST; if (i >= 0) r = FEST.filter((f) => new RegExp(names[i] + "|\\b" + MON[i], "i").test(f.when) || (f.spans || []).some(([a, b]) => i >= a - 0 && i <= b - 0));
  return { festivals: r.map((f) => ({ name: f.s || f.t, when: f.when, where: f.at })), note: "Festival dates follow regional calendars and vary from year to year; consult the organiser’s published schedule for your travel dates." };
}
export function food_info({ query } = {}) {
  const q = String(query || "").toLowerCase(), all = [...FOOD.map(([t, d, when, find]) => ({ name: t, what: trim(d, 330), when, where_to_look: find })), ...CLASSICS.map(([t, d]) => ({ name: t, what: d }))];
  const words = q.split(/\W+/).filter((w) => w.length > 2 && !["the", "and", "for", "what", "food", "eat", "try", "dish", "dishes"].includes(w));
  const hit = words.length ? all.filter((f) => words.some((w) => (f.name + " " + f.what).toLowerCase().includes(w))) : [];
  return { dishes: (hit.length ? hit : all).slice(0, 6), note: "Dishes only; no restaurant names or ratings are verified." };
}
export function practical_info({ topic } = {}) {
  if (topic === "stay") return { areas_to_stay: AREAS.map(([n, , d]) => ({ area: n, why: d })), stay_types: STAYTYPES.map(([t, d]) => ({ type: t, tip: d })) };
  return { getting_there: INFO.map(([t, d]) => ({ mode: t, info: d })), emergency: "112 (all emergencies), 100 police, 108 ambulance." };
}
export const RUN = { distance, place_info, list_places, build_itinerary, season_advice, festivals, food_info, practical_info };
export function runTool(name, args) { try { return (RUN[name] || (() => ({ error: "unknown tool" })))(args || {}); } catch (e) { return { error: "tool failed" }; } }
const fn = (name, description, properties = {}, required = []) => ({ type: "function", function: { name, description, parameters: { type: "object", properties, required } } });
const S = { type: "string" };
export const TOOLS = [
  fn("distance", "Straight-line and estimated road distance and drive time between two places in or near Udupi (e.g. Malpe, Manipal, Mangaluru airport, Kundapura).", { from: S, to: S }, ["from", "to"]),
  fn("place_info", "Detailed facts about one place from the guide: story, things to notice, best time, time needed, how to reach, what pairs well with it.", { name: S }, ["name"]),
  fn("list_places", "List places, optionally by category, hidden gems only, or sorted by distance from a place.", { category: { type: "string", enum: Object.keys(CT) }, hidden_gem: { type: "boolean" }, near: S, max_km: { type: "number" }, limit: { type: "number" } }),
  fn("build_itinerary", "Build a geographically sensible multi-day itinerary (1 to 5 days). Use this for any plan, then explain and enrich the result.", { days: { type: "number" }, interests: { type: "array", items: { type: "string", enum: Object.keys(CT) } }, pace: { type: "number", description: "stops per day, 2 relaxed to 4 busy" }, base: { type: "string", description: "Udupi, Malpe or Manipal" }, mobility_friendly: { type: "boolean", description: "true for elderly or limited mobility; drops rocky or hard-access places" }, around: { type: "string", description: "optional place to centre the plan on" } }),
  fn("season_advice", "Weather and visiting advice for a month, or for the whole year if no month is given.", { month: S }),
  fn("festivals", "Festivals and their typical timing, optionally for one month.", { month: S }),
  fn("food_info", "Local dishes: what they are, when they are eaten, what to look for.", { query: S }),
  fn("practical_info", "Getting there (rail, air, road, emergency numbers) or where to stay (areas and stay types).", { topic: { type: "string", enum: ["transport", "stay"] } }),
];
// Compact fact sheet for the system prompt. Details come from the tools, so this stays small.
export const FACTS = () => `PLACES (id | name | type | tagline | lat,lon):\n${P.map((p) => `${p.id} | ${p.n} | ${p.c}${p.g ? " (hidden gem)" : ""} | ${p.tag} | ${p.la.toFixed(3)},${p.ln.toFixed(3)}`).join("\n")}\nBASES: ${HUBS.map((h) => h.n).join(", ")}.\nFESTIVALS: ${FEST.map((f) => f.s || f.t).join("; ")}.\nDISHES: ${[...FOOD, ...CLASSICS].map((f) => f[0]).join("; ")}.`;

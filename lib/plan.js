import { P, km } from "./data";
// Itinerary builder shared by the Planner section, the guide and the guide API.
// Pick by editorial rank, split north to south so a day stays in one stretch of coast,
// then order each day by nearest neighbour from the base (ferry first, Malpe sunset last).
export function order(day, hub) {
  const rest = [...day], out = []; let cur = hub;
  while (rest.length) { rest.sort((a, b) => km(cur, a) - km(cur, b)); cur = rest.shift(); out.push(cur); }
  const f = out.findIndex((p) => p.id === "stm"); if (f > 0) out.unshift(...out.splice(f, 1));
  const m = out.findIndex((p) => p.id === "malpe"); if (m >= 0 && m < out.length - 1) out.push(...out.splice(m, 1));
  return out;
}
// around = optional place to build the days around (the nearest stops to it are used instead of the editorial top picks).
export function buildPlan({ days, pace, w, eld, hub, around }) {
  let pool = P.filter((p) => w.includes(p.c) && !(eld && p.hard));
  pool = around ? pool.sort((a, b) => km(around, a) - km(around, b)).slice(0, days * pace) : pool.sort((a, b) => a.r - b.r).slice(0, days * pace);
  pool.sort((a, b) => b.la - a.la);
  const per = Math.ceil(pool.length / days) || 1;
  return Array.from({ length: days }, (_, i) => pool.slice(i * per, (i + 1) * per)).filter((d) => d.length).map((d) => order(d, hub).map((p) => p.id));
}

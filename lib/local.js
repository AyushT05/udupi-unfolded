import { P, FOOD, CLASSICS, FEST, HUBS, CT, byId, lookup } from "./data";
import { distance, place_info, list_places, build_itinerary, season_advice, festivals, food_info, practical_info } from "./guide-tools";
// The guide when no language model is configured. It reads the question, works out what is being asked (a plan, a distance, a place,
// a dish, a festival, a season ...) and answers from the site's own data using the same tools the live model uses.
// It is rule-based, so it will not chat about anything, but it handles real trip questions, remembers the previous question for
// short follow-ups ("make it 3 days"), and always tells you what else it can do.
const NUM = { one: 1, a: 1, two: 2, three: 3, four: 4, five: 5, weekend: 2 };
const MONTH = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/;
const bold = (s) => `**${s}**`;
const first = (s, n = 2) => (s.replace(/\s{2,}/g, " ").match(/[^.!?]+[.!?]+/g) || [s]).slice(0, n).join(" ").trim();
const HELP = "I can plan days (try “plan 2 days with beaches and temples”), work out distances (“how far is Kaup from Malpe?”), describe any place, suggest things for rain, family, elderly parents or couples, explain dishes and festivals, and say when to visit.";

function days(q) { const all = [...q.matchAll(/\b(\d|one|two|three|four|five|a)\s*-?\s*(?:day|days|night|nights)\b|\b(weekend)\b/g)], m = all[all.length - 1]; if (!m) return /\bday\b/.test(q) ? 1 : 2; const k = m[1] || m[2]; return Math.max(1, Math.min(5, NUM[k] || +k || 1)); }
function interests(q) { const r = []; if (/beach|sea|sand|sunset|sunrise|coast/.test(q)) r.push("beach"); if (/temple|spiritual|religio|krishna|devot/.test(q)) r.push("temple"); if (/heritage|history|museum|culture|fort|jain|basadi/.test(q)) r.push("heritage"); if (/nature|view|hill|waterfall|river|scenic|trek/.test(q)) r.push("nature"); if (/island|ferry|basalt|st mary/.test(q)) r.push("island"); return r; }
const hubOf = (q) => (/stay(ing)? (in|at|near)? ?malpe|base.*malpe|from malpe/.test(q) ? "malpe" : /manipal/.test(q) && /stay|base|from manipal/.test(q) ? "manipal" : "udupi");

function plan(q, raw) {
  const d = days(q), ints = interests(q), eld = /elder|parent|senior|old age|knee|wheelchair|mobility|grandparent/.test(q);
  const placeHits = lookup(raw).map((p) => byId(p.id)).filter(Boolean);
  const wantFood = /food|eat|dosa|taste|cuisine/.test(q), res = build_itinerary({ days: d, interests: wantFood && ints.length && !ints.includes("temple") ? [...ints, "temple"] : ints, pace: /relax|slow|easy|lazy/.test(q) ? 2 : /packed|busy|everything|maximum/.test(q) ? 4 : 3, base: hubOf(q), mobility_friendly: eld, around: d === 1 && placeHits[0] ? placeHits[0].n : undefined });
  const dish = (i) => FOOD[(i * 3 + 1) % FOOD.length][0];
  const out = [`Here is a ${d}-day plan${res.built_around ? ` built around ${res.built_around}` : ""}, starting from ${res.base}${eld ? " and avoiding rocky or hard-access stops" : ""}:`];
  res.days.forEach((x, i) => {
    out.push(`\n${bold("Day " + x.day)}`);
    x.stops.forEach((s, k) => out.push(`${k + 1}. ${bold(s.name)}: ${s.tagline.toLowerCase()}${s.time_needed ? ` (${s.time_needed.replace(/^./, (c) => c.toLowerCase())})` : ""}${k ? `, about ${s.km_from_previous} km from the last stop` : ""}`));
    out.push(`Eat: look for ${dish(i)} along the way.`);
  });
  const tips = [];
  if (res.days.some((x) => x.stops.some((s) => s.name.startsWith("St Mary")))) tips.push("St Mary’s is reached by ferry from Malpe, so it goes first, and the ferries stop in the monsoon (June to September)");
  if (res.days.some((x) => x.stops.some((s) => s.name.startsWith("Malpe")))) tips.push("Malpe is saved for the end of the day for sunset");
  if (/food|eat|dosa|taste/.test(q)) tips.push("for food, queue at a temple meal near the Matha and try fish thali near Malpe harbour");
  out.push(`\nTips: ${(tips.length ? tips : ["start early, since mornings are quieter and cooler"]).join("; ")}. Distances are straight-line, so roads run 15 to 40 percent longer. Tell me to “make it 3 days”, “add beaches only” or “keep it easy for elderly parents” and I will rebuild it.`);
  return out.join("\n");
}
function dist(q, raw) {
  const f = lookup(raw).slice(0, 2); if (f.length < 1) return null;
  const a = f.length === 2 ? f[0] : HUBS[0], b = f.length === 2 ? f[1] : f[0];
  if (a.n === b.n) return null;
  const r = distance({ from: a.n, to: b.n });
  return r.error ? null : `${bold(`${r.from} to ${r.to}`)}: about ${r.straight_line_km} km in a straight line, roughly ${r.road_km_estimate} km by road (${r.drive_time_estimate}).${f.length === 1 ? " I assumed you are starting from Udupi town." : ""}\nThese are planning estimates based on mapped locations; allow extra time for traffic, stops and local road conditions.`;
}
function nearby(q, raw) {
  const f = lookup(raw)[0]; if (!f) return null;
  const r = list_places({ near: f.n, limit: 5 });
  return r.places.length ? `Closest to ${bold(f.n)} (straight-line):\n` + r.places.map((p) => `- ${bold(p.name)}: ${p.km_from_origin} km, ${p.tagline.toLowerCase()}`).join("\n") : null;
}
function placeAnswer(p) {
  const i = place_info({ name: p.n }); if (i.error) return null;
  const o = [`${bold(i.name)}: ${i.tagline}.`, first(i.summary, 3)];
  if (i.things_to_notice.length) o.push("Notice: " + i.things_to_notice.slice(0, 3).join("; ") + ".");
  if (i.best_time) o.push(`Best time: ${i.best_time}`);
  if (i.time_needed) o.push(`Allow: ${i.time_needed}.`);
  if (i.how_to_reach) o.push(`Getting there: ${i.how_to_reach}`);
  if (i.pairs_well_with.length) o.push(`Pairs well with: ${i.pairs_well_with.join(", ")}.`);
  return o.join("\n");
}
function category(q) {
  let cat = /beach/.test(q) ? "beach" : /temple/.test(q) ? "temple" : /island/.test(q) ? "island" : /heritage|museum|history/.test(q) ? "heritage" : /nature|view|scenic/.test(q) ? "nature" : null;
  const gem = /hidden|gem|offbeat|off the beaten|quiet|crowd|peace|undiscovered/.test(q);
  if (!cat && !gem) return null;
  const r = list_places({ category: cat || undefined, hidden_gem: gem ? true : undefined, limit: 8 });
  const head = gem ? (cat ? `Quieter ${CT[cat].toLowerCase()} picks:` : "Quieter, lesser-visited picks:") : `${CT[cat]} I would point you to:`;
  return head + "\n" + r.places.map((p) => `- ${bold(p.name)}: ${p.tagline.toLowerCase()}`).join("\n") + (gem ? "\nThese quieter stops are best explored with time for the surrounding villages and landscape." : "\nAsk about any of them by name for details.");
}
function food(q) {
  const r = food_info({ query: q }), named = r.dishes.length < 6 && r.dishes.length > 0;
  if (!/food|eat|dish|dosa|breakfast|lunch|dinner|snack|sweet|veg|fish|seafood|taste|try|cook|hungry|pathrode|moode|kadubu|hayagreeva|sajjige|bajil|rotti|pulimunchi|neer|gulla|meal/.test(q)) return null;
  return (named ? "" : "Dishes worth seeking out:\n") + r.dishes.slice(0, named ? 3 : 6).map((d) => `- ${bold(d.name)}: ${first(d.what, 1)}${d.when ? ` (${d.when.replace(/^./, (c) => c.toLowerCase())})` : ""}`).join("\n") + "\nFor the freshest experience, look for busy local kitchens and ask which dishes are in season.";
}
function fest(q) {
  const m = q.match(MONTH), hit = FEST.find((f) => q.includes((f.s || f.t).toLowerCase().split(/[ &(]/)[0]) && (f.s || f.t).length > 3);
  if (hit) return `${bold(hit.s || hit.t)} (${hit.when}), at ${hit.at}.\n${first(hit.d[0], 3)}`;
  if (!/festival|utsav|habba|celebrat|\bfair\b|event|parade|procession|navaratri|dasara|deepotsava|paryaya|sankranti|janmashtami/.test(q)) return null;
  const r = festivals({ month: m ? m[1] : undefined });
  return (m ? `Around ${m[0].replace(/^./, (c) => c.toUpperCase())}:` : "Main festivals:") + "\n" + (r.festivals.length ? r.festivals.map((f) => `- ${bold(f.name)}: ${f.when}`).join("\n") : "- Nothing major in my list for that month.") + "\nFestival dates shift with the lunar calendar; check the annual temple calendar before finalising travel.";
}
function season(q) {
  const m = q.match(MONTH); if (!/when|season|month|weather|climate|best time|monsoon|summer|winter|hot|cold|visit in|go in/.test(q) && !m) return null;
  const r = season_advice({ month: m ? m[1] : undefined });
  return r.best ? `${bold("Best:")} ${r.best}\n${bold("Shoulder:")} ${r.shoulder}\n${bold("Avoid for the sea:")} ${r.avoid}` : `${bold(r.month)}: ${r.summary} (comfort ${r.comfort_score_out_of_10}/10).${r.festivals_this_month.length ? " Festivals: " + r.festivals_this_month.map((f) => f.name).join(", ") + "." : ""}`;
}
const WHO = [
  [/rain|monsoon|wet|storm/, "In heavy rain (roughly June to September) island ferries are suspended and the sea is rough. Good covered or inland options: the Krishna Matha and Anantheshwara Temple (a temple meal is a fine rainy-day plan), Hasta Shilpa Heritage Village in Manipal, and Karkala’s heritage stops. Try pathrode, the monsoon dish. Keep the beach for a dry break and stay out of the water."],
  [/elder|parent|senior|grandparent|old age|knee|mobility|wheelchair/, "For elderly parents: base in Udupi town and start with the Krishna Matha and Anantheshwara Temple, which are close together and flat. Add Malpe for a gentle sunset walk and Kaup for the lighthouse view. Skip St Mary’s unless the ferry operator confirms easy conditions, since the ground is rocky. Go early to avoid queues and heat. I can build a full easy plan: say “plan 2 days for elderly parents”."],
  [/famil|kid|child|toddler/, "For families: Malpe for beach time (keep children out of the sea unless it is clearly safe), Hasta Shilpa Heritage Village for something to see, and a temple meal at the Matha. Pick one beach a day and leave slack for naps. Say “plan 2 days for a family” and I will build it."],
  [/couple|romantic|honeymoon|date/, "For couples: sunset at Malpe or Kaup, a quiet morning at a calmer beach such as Kodi or Mattu, and the river-meets-sea drive near Maravanthe. Add the Matha early for the atmosphere. Say “plan 2 days for a couple with beaches” for a full plan."],
  [/solo|alone|backpack/, "For a solo trip: base in Udupi town, walk the Matha and Car Street, take a local bus or auto to Malpe for sunset, and add St Mary’s by ferry in season. The coast is easy to get around with autos and buses, and Udupi’s temple meals are friendly to solo travellers."],
  [/photo|instagram|sunset|sunrise|golden/, "For photographs: Malpe harbour at sunrise (boats, nets, gulls), sunset at Malpe or Kaup, the basalt columns of St Mary’s in season, and Car Street in the morning light. Carry a lens cloth for the salt air."],
  [/safe|swim|dangerous|current|drown/, "Treat the sea with respect: many beaches here have strong currents and swimming is not always safe, especially in and near the monsoon. Swim only where lifeguards or locals say it is fine, follow any flags or signs, and keep children close. Emergency number: 112."],
  [/budget|cheap|price|cost|₹|rupee|expensive|how much/, "Costs vary by season and travel style. For a value-focused visit, stay in Udupi town, use local buses and auto-rickshaws, and explore the temple quarter and public beaches between paid attractions."],
];
function stay(q) { if (!/stay|hotel|resort|homestay|accommodation|where to sleep|base/.test(q)) return null; const r = practical_info({ topic: "stay" }); return "Where to base yourself:\n" + r.areas_to_stay.map((a) => `- ${bold(a.area)}: ${a.why}`).join("\n") + "\nCompare recent guest feedback, location and included facilities before choosing a property."; }
function reach(q) { if (!/reach|get there|getting there|train|rail|flight|airport|fly|bus|transport|taxi|auto|drive from|how to come/.test(q)) return null; const r = practical_info({ topic: "transport" }); return "Getting here:\n" + r.getting_there.map((a) => `- ${bold(a.mode)}: ${a.info}`).join("\n") + "\nMangaluru airport to Udupi is roughly 55 km as the crow flies, so allow a couple of hours by road."; }
function search(q) {
  const w = q.split(/\W+/).filter((x) => x.length > 3 && !["what", "tell", "about", "where", "which", "with", "udupi", "there", "have", "would", "could", "should", "please"].includes(x)); if (!w.length) return null;
  const sc = P.map((p) => [p, w.reduce((s, x) => s + ((p.n + " " + p.tag).toLowerCase().includes(x) ? 3 : 0) + (p.d.toLowerCase().includes(x) ? 1 : 0), 0)]).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return sc.length ? "Closest matches in the guide:\n" + sc.map(([p]) => `- ${bold(p.n)}: ${p.tag.toLowerCase()}`).join("\n") + "\nAsk about any of them by name for details." : null;
}
export function localAnswer(messages) {
  const raw = messages[messages.length - 1].content.trim(), prevU = messages.filter((m) => m.role === "user").slice(-2, -1)[0]?.content || "";
  let q = raw.toLowerCase();
  if (/^(hi|hello|hey|namaste|namaskara|good (morning|evening|afternoon))\b/.test(q) && q.split(/\s+/).length < 5) return "Namaste! I’m the Udupi guide. " + HELP;
  if (/^(thanks|thank you|thx|ok|okay|great|cool|nice)\b/.test(q) && q.split(/\s+/).length < 5) return "Happy to help. Ask me anything else about Udupi, or say “plan 2 days” for a full itinerary.";
  if (/what can you do|help|how do you work|who are you/.test(q) && q.split(/\s+/).length < 8) return HELP;
  const followUp = q.split(/\s+/).length <= 6 && /^(make|add|and|also|what about|how about|only|without|with|more|less|then|change|instead)\b|\bit\b|\bthat\b|days?$/.test(q) && prevU;
  const full = followUp ? prevU + " " + raw : raw, fq = full.toLowerCase();
  const planWords = /\bplan\b|itinerar|schedule|weekend|\b\d\s*-?\s*days?\b|\b(one|two|three|four|five) days?\b|day trip|a day (in|around|at)|spend (a|one|two|three)|cover (udupi|the coast)/.test(fq);
  const distWords = /how far|distance|\bkm\b|kilomet|how long (to|does|will)|travel time|drive time|\bfrom\b.+\bto\b|between/.test(q);
  if (distWords && !planWords) { const a = dist(q, raw); if (a) return a; }
  if (planWords) return plan(fq, full);
  if (/hidden|gem|offbeat|off the beaten|undiscovered/.test(q)) { const a = category(q); if (a) return a; }
  if (/\bnear(by|est)?\b|close to|around (?!the world)/.test(q)) { const a = nearby(q, raw); if (a) return a; }
  const hit = lookup(raw).map((p) => byId(p.id)).filter(Boolean);
  if (hit.length && !/eat|food|festival/.test(q)) { const a = placeAnswer(hit[0]); if (a) return a; }
  for (const [re, t] of WHO) if (re.test(q)) return t;
  return fest(q) || category(q) || food(q) || season(q) || stay(q) || reach(q) || search(q) || "That detail is not covered in this guide yet. " + HELP;
}

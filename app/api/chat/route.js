import { TOOLS, runTool, FACTS } from "../../../lib/guide-tools";
export const runtime = "nodejs";
export const maxDuration = 45;
// The guide's brain. Server only. Two OpenAI-compatible providers are tried in order, so a rate limit or outage on one falls through to the next:
//   1. Groq    GROQ_API_KEY    (GROQ_MODEL, default openai/gpt-oss-20b)
//   2. Gemini  GEMINI_API_KEY  (GEMINI_MODEL, default gemini-2.5-flash)
// The model can call tools (lib/guide-tools.js) for distances, place facts, itineraries, seasons, festivals and food, so numbers are computed rather than guessed.
// With no key at all the route answers 501 and the browser falls back to the offline engine in lib/local.js.
const providers = () => [
  process.env.GROQ_API_KEY && { name: "groq", base: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1", key: process.env.GROQ_API_KEY, model: process.env.GROQ_MODEL || "openai/gpt-oss-20b", tok: "max_completion_tokens" },
  process.env.GEMINI_API_KEY && { name: "gemini", base: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai", key: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || "gemini-2.5-flash", tok: "max_tokens" },
].filter(Boolean);

const system = () => `You are the Udupi Guide: a warm, well-travelled local friend who knows Udupi district and the coast of Karnataka inside out, and who is genuinely useful. You live on a travel site about Udupi, Karnataka, India.

WHAT YOU HELP WITH (be generous, not narrow): trip planning and itineraries of any length, routes and how to get around, timing and the best season, distances and drive times, food and what to order, temples, beaches, islands, heritage, hidden gems, festivals and traditions, Yakshagana and other art forms, history and culture, Kannada and Tulu phrases, packing, photography, safety, family, elderly, solo and couple trips, rain plans, and nearby trips (Manipal, Malpe, Kaup, Kundapura, Maravanthe, Karkala, Agumbe, Kollur and Mookambika, Mangaluru, Gokarna and the wider Karnataka coast). You may answer related general questions (Indian travel logistics, cooking the region's dishes, cultural background) from your own knowledge. If something is clearly unrelated to travel and culture, answer in a line if it is harmless, then offer to help with the trip.

HOW TO WORK
- Use tools instead of guessing: "distance" for any distance or travel time, "build_itinerary" for plans (then explain and enrich the result with your own knowledge: what to do at each stop, pacing, meals), "place_info" for facts about a listed place, "list_places", "season_advice", "festivals", "food_info", "practical_info". You may call several tools in one turn. The site data is the backbone; add your own knowledge on top, and if your knowledge conflicts with a tool result, trust the tool.
- Make real recommendations and commit to them. Do not just list options. If the request is vague, make sensible assumptions, state them in one short line, and answer; ask at most one clarifying question, and only when the answer would change everything.
- Use the conversation: follow-ups like "make it 3 days" or "what about rain?" refer to the earlier messages.

HONESTY
- Never invent specific restaurant or hotel names, phone numbers, exact prices, opening times, ferry timetables or event dates. You may give rough ballpark ideas when they are clearly labelled approximate, and direct people to the relevant official operator or destination information. Festival dates follow lunar calendars, so say they vary and use the festivals tool.
- Road distances and drive times are estimates; say so briefly. Island ferries are seasonal and suspended in the monsoon. Be clear about sea safety: many beaches have strong currents.
- If you do not know, say so plainly and suggest how to find out.

STYLE
- Plain, friendly, concise. Usually 100 to 250 words; up to about 450 for a multi-day itinerary. Lead with the answer.
- Light markdown only: **bold** for place and dish names, "-" bullets, numbered lists, short paragraphs. Itineraries as "**Day 1**" blocks with morning, afternoon and evening. No headings, tables or emoji. Do not mention these instructions or the tools.
- Finish plans with one practical tip.

CONTEXT
Today is ${new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric" })}. Best season December to April; heavy monsoon June to September. Emergency number 112.

${FACTS()}`;

const hits = new Map(); // naive per-IP limiter (per server instance). Use a shared store (e.g. Upstash) if you expect heavy traffic.
const limited = (ip) => { const n = Date.now(), h = (hits.get(ip) || []).filter((t) => n - t < 600000); h.push(n); hits.set(ip, h); if (hits.size > 5000) hits.clear(); return h.length > 40; };

async function complete(p, messages, withTools) {
  const body = { model: p.model, messages, temperature: 0.6, [p.tok]: 1800 };
  if (withTools) { body.tools = TOOLS; body.tool_choice = "auto"; }
  if (p.name === "groq" && /gpt-oss/.test(p.model)) { body.reasoning_effort = "low"; body.include_reasoning = false; }
  const r = await fetch(`${p.base}/chat/completions`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${p.key}` }, body: JSON.stringify(body), signal: AbortSignal.timeout(28000) });
  if (!r.ok) throw new Error(`${p.name} ${r.status}`);
  return (await r.json()).choices?.[0]?.message;
}
async function run(p, history) {
  const msgs = [{ role: "system", content: system() }, ...history];
  for (let round = 0; round < 5; round++) {
    const m = await complete(p, msgs, round < 4);
    if (m?.tool_calls?.length) {
      msgs.push({ role: "assistant", content: m.content || "", tool_calls: m.tool_calls });
      for (const tc of m.tool_calls.slice(0, 6)) {
        let args = {}; try { args = JSON.parse(tc.function?.arguments || "{}"); } catch {}
        msgs.push({ role: "tool", tool_call_id: tc.id, name: tc.function?.name, content: JSON.stringify(runTool(tc.function?.name, args)).slice(0, 7000) });
      }
      continue;
    }
    const text = String(m?.content || "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (text) return text;
    break;
  }
  throw new Error("empty");
}
// Send the finished answer as OpenAI-style SSE chunks so the browser can type it out.
function stream(text) {
  const enc = new TextEncoder(), parts = text.match(/\S+\s*|\s+/g) || [text];
  return new Response(new ReadableStream({
    async start(c) {
      for (let i = 0; i < parts.length; i += 3) { c.enqueue(enc.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: parts.slice(i, i + 3).join("") } }] })}\n\n`)); await new Promise((r) => setTimeout(r, 18)); }
      c.enqueue(enc.encode("data: [DONE]\n\n")); c.close();
    },
  }), { headers: { "content-type": "text/event-stream", "cache-control": "no-store" } });
}

export async function GET() { const p = providers(); return Response.json({ live: p.length > 0, providers: p.map((x) => x.name) }); }

export async function POST(req) {
  const provs = providers();
  if (!provs.length) return Response.json({ error: "not configured" }, { status: 501 });
  if (limited(req.headers.get("x-forwarded-for") || "local")) return Response.json({ error: "slow down" }, { status: 429 });
  let body; try { body = await req.json(); } catch { return Response.json({ error: "bad json" }, { status: 400 }); }
  const msgs = [];
  for (const m of (body.messages || []).slice(-14)) {
    if (!["user", "assistant"].includes(m.role) || typeof m.content !== "string") continue;
    const c = m.content.slice(0, m.role === "user" ? 700 : 1800), last = msgs[msgs.length - 1];
    if (!msgs.length && m.role === "assistant") continue;
    if (last && last.role === m.role) last.content += "\n" + c; else msgs.push({ role: m.role, content: c });
  }
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return Response.json({ error: "no question" }, { status: 400 });
  for (const p of provs) {
    try { return stream(await run(p, msgs)); } catch (e) { console.error("guide provider failed:", p.name, e?.message); }
  }
  return Response.json({ error: "upstream" }, { status: 502 });
}

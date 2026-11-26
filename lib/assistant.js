import { localAnswer } from "./local";
export async function status() {
  try { const r = await fetch("/api/chat"); return await r.json(); } catch { return { live: false }; }
}
// Streams from /api/chat (a language model with tools; see app/api/chat/route.js). If the server has no key, is rate limited or fails,
// the built-in engine (lib/local.js) answers instead, so the guide always works. Returns { text, live }.
export async function ask(messages, onText, signal) {
  try {
    const r = await fetch("/api/chat", { method: "POST", signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }) });
    if (r.ok && r.body) {
      const rd = r.body.getReader(), dec = new TextDecoder(); let buf = "", out = "";
      for (;;) {
        const { done, value } = await rd.read(); if (done) break;
        buf += dec.decode(value, { stream: true }); const lines = buf.split("\n"); buf = lines.pop();
        for (const l of lines) {
          if (!l.startsWith("data:")) continue; const d = l.slice(5).trim(); if (!d || d === "[DONE]") continue;
          try { const t = JSON.parse(d).choices?.[0]?.delta?.content; if (t) { out += t; onText(out); } } catch {}
        }
      }
      if (out.trim()) return { text: out, live: true };
    }
  } catch (e) { if (e?.name === "AbortError") return { text: "", live: true, aborted: true }; }
  const t = localAnswer(messages), parts = t.match(/\S+\s*|\s+/g) || [t]; let out = "";
  for (let i = 0; i < parts.length; i += 4) { if (signal?.aborted) return { text: out, live: false, aborted: true }; out += parts.slice(i, i + 4).join(""); onText(out); await new Promise((r) => setTimeout(r, 16)); }
  return { text: t, live: false };
}

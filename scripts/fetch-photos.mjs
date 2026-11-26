// npm run photos [-- --force] [-- --only=malpe,stm]
// Needs Node 18+ and internet. Existing public/img/<id>.jpg files are kept (so your own photos are never
// overwritten) unless you pass --force. Open public/img/review.html afterwards and fix any wrong pick by
// setting `file: "Exact name.jpg"` for that id in lib/photos.mjs, then run again with --force --only=<id>.
import { writeFile, mkdir, access } from "node:fs/promises";
import { PH } from "../lib/photos.mjs";

const force = process.argv.includes("--force");
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);
const H = { headers: { "User-Agent": "udupi-guide/2.0 (local dev photo script; contact: site owner)" } };
const COMMONS = "https://commons.wikimedia.org/w/api.php", WIKI = "https://en.wikipedia.org/w/api.php";
const qs = (o) => new URLSearchParams({ format: "json", formatversion: "2", ...o }).toString();
const get = async (base, o) => (await fetch(`${base}?${qs(o)}`, H)).json();
const strip = (s) => (s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BAD = /map|logo|flag|poster|plan|diagram|sign|chart|\.svg|\.png|\.gif|\.pdf|\.tif|stamp|coin|cover/i;

async function info(titles) {
  const r = await get(COMMONS, { action: "query", titles: titles.map((t) => "File:" + t.replace(/^File:/, "")).join("|"), prop: "imageinfo", iiprop: "url|mime|size|extmetadata", iiurlwidth: 1800 });
  return (r.query?.pages || []).filter((p) => p.imageinfo?.[0]).map((p) => ({ title: p.title.replace(/^File:/, ""), ...p.imageinfo[0] }));
}
const ok = (i, wide) => i.mime === "image/jpeg" && i.width >= 1400 && !BAD.test(i.title) && (!wide || i.width >= i.height * 1.15);

async function fromFile(f) { return (await info([f]))[0]; }
async function fromWiki(t) {
  const r = await get(WIKI, { action: "query", redirects: 1, titles: t, prop: "pageimages", piprop: "name" });
  const name = r.query?.pages?.[0]?.pageimage;
  if (!name) return null;
  const i = (await info([name]))[0];
  return i && ok(i, false) ? i : null;
}
async function fromCat(c) {
  const r = await get(COMMONS, { action: "query", list: "categorymembers", cmtitle: "Category:" + c, cmtype: "file", cmlimit: 50 });
  const names = (r.query?.categorymembers || []).map((m) => m.title.replace(/^File:/, ""));
  if (!names.length) return null;
  const all = await info(names);
  const good = all.filter((i) => ok(i, true)).sort((a, b) => b.width * b.height - a.width * a.height);
  return good[0] || null;
}

await mkdir("public/img", { recursive: true });
const credits = {}, rows = [];
try { Object.assign(credits, JSON.parse(await (await import("node:fs/promises")).readFile("public/img/credits.json", "utf8"))); } catch {}

for (const p of PH) {
  if (only.length && !only.includes(p.id)) continue;
  const path = `public/img/${p.id}.jpg`;
  if (!force) { try { await access(path); console.log("kept :", p.id, "(exists)"); continue; } catch {} }
  let hit = null, via = "";
  try {
    if (p.file) { hit = await fromFile(p.file); via = "file"; }
    for (const t of hit ? [] : p.wiki || []) { hit = await fromWiki(t); if (hit) { via = "wikipedia:" + t; break; } await sleep(300); }
    for (const c of hit ? [] : p.cats || []) { hit = await fromCat(c); if (hit) { via = "category:" + c; break; } await sleep(300); }
    if (!hit?.thumburl) { console.log("MISS :", p.id, "- add a `file` in lib/photos.mjs or drop your own public/img/" + p.id + ".jpg"); rows.push({ id: p.id, miss: 1 }); continue; }
    await writeFile(path, Buffer.from(await (await fetch(hit.thumburl, H)).arrayBuffer()));
    const m = hit.extmetadata || {};
    credits[p.id] = { title: hit.title, artist: strip(m.Artist?.value), license: strip(m.LicenseShortName?.value), page: hit.descriptionurl };
    rows.push({ id: p.id, via, title: hit.title, page: hit.descriptionurl });
    console.log("ok   :", p.id, "<-", hit.title, `(${via})`);
  } catch (e) { console.log("FAIL :", p.id, e.message); rows.push({ id: p.id, miss: 1 }); }
  await sleep(600);
}
await writeFile("public/img/credits.json", JSON.stringify(credits, null, 2));
await writeFile("public/img/review.html", `<!doctype html><meta charset=utf-8><title>Photo review</title><style>body{font:14px system-ui;background:#061a20;color:#eee;margin:2rem}div{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.2rem}figure{margin:0}img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;background:#123}a{color:#f2a93b}</style><h1>Review: does each photo match its place?</h1><p>Wrong one? Set <code>file</code> for that id in lib/photos.mjs, then <code>npm run photos -- --force --only=id</code>. Or drop your own public/img/&lt;id&gt;.jpg.</p><div>${rows.map((r) => `<figure><img src="${r.id}.jpg" alt=""><figcaption><b>${r.id}</b> ${r.miss ? "MISSING" : `${r.via}<br>${r.title} · <a href="${r.page}">source</a>`}</figcaption></figure>`).join("")}</div>`);
console.log("\nDone. Open public/img/review.html (e.g. http://localhost:3000/img/review.html) and check each photo.");

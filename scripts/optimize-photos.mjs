// npm run photos
// Reads originals from photos-raw/ (name each file after its slot id, e.g. malpe.jpg, food-dosa.heic is NOT supported, use jpg/png/webp),
// writes optimised public/img/<id>.jpg (2400px wide max, quality 80) and reports what is still missing.
import { readdir, mkdir, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PH } from "../lib/photos.mjs";

const SRC = "photos-raw", OUT = "public/img", ids = new Set(PH.map((p) => p.id));
await mkdir(SRC, { recursive: true }); await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp|tiff?|avif)$/i.test(f));
for (const f of files) {
  const id = path.parse(f).name;
  if (!ids.has(id)) { console.log("skip (no such slot):", f); continue; }
  const info = await sharp(path.join(SRC, f)).rotate().resize({ width: 2400, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, id + ".jpg"));
  console.log("ok  :", id.padEnd(16), `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
}
const have = async (id) => access(path.join(OUT, id + ".jpg")).then(() => 1, () => 0);
const miss = [], opt = [];
for (const p of PH) if (!(await have(p.id))) (p.req ? miss : opt).push(p.id);
console.log(`\nMissing required (${miss.length}): ${miss.join(", ") || "none"}\nMissing optional (${opt.length}): ${opt.join(", ") || "none"}`);

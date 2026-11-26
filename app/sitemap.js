import { P } from "../lib/data";
import { SITE } from "../lib/site";
export default function sitemap() {
  const now = new Date();
  return [{ url: SITE + "/", lastModified: now, changeFrequency: "monthly", priority: 1 }, ...P.map((p) => ({ url: `${SITE}/places/${p.id}`, lastModified: now, changeFrequency: "yearly", priority: 0.7 }))];
}

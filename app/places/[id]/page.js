import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "../../../components/Nav";
import Photo from "../../../components/Photo";
import Figure from "../../../components/Figure";
import { kindOf } from "../../../components/Scene";
import { Footer } from "../../../components/Footer";
import { P, HUBS, CT, byId, maps, dirs, km } from "../../../lib/data";
import { DET } from "../../../lib/details";

export const generateStaticParams = () => P.map((p) => ({ id: p.id }));
export async function generateMetadata({ params }) {
  const { id } = await params, p = byId(id);
  if (!p) return {};
  const title = `${p.n} | Udupi | A coastal guide`, description = DET[p.id].s;
  return { title, description, openGraph: { title, description, type: "article", locale: "en_IN" }, twitter: { card: "summary_large_image", title, description } };
}
const photoId = (p) => (p.g ? `gem-${p.id}` : p.id);

export default async function PlacePage({ params }) {
  const { id } = await params, p = byId(id);
  if (!p) notFound();
  const d = DET[p.id], i = P.indexOf(p), prev = P[(i - 1 + P.length) % P.length], next = P[(i + 1) % P.length];
  const dist = Math.max(1, Math.round(km(HUBS[0], p)));
  const ld = { "@context": "https://schema.org", "@type": "TouristAttraction", name: p.n, description: d.s, geo: { "@type": "GeoCoordinates", latitude: p.la, longitude: p.ln }, containedInPlace: { "@type": "Place", name: "Udupi, Karnataka, India" } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Nav />
      <main>
        <header className="pd-hero">
          <div className="pd-bg"><Photo id={photoId(p)} fallback={p.id} kind={kindOf(p.c)} alt="" priority scene="error" /></div>
          <div className="hshade" />
          <div className="pblur" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="pd-hd">
            <Link className="pd-back" href="/#places" data-curtain>← All places</Link>
            <p className="eb">{CT[p.c]} · {p.tag}</p>
            <h1 className="pd-title">{p.n}</h1>
            <p className="pd-lede">{d.s}</p>
          </div>
        </header>

        <section className="sec sand pd-body">
          <div className="wrap pd-grid">
            <article className="pd-story">
              {(() => { let fig = 0; return d.story.map((b, k) => typeof b === "string" ? <p key={k} className={k === 0 ? "pd-first" : ""}>{b}</p> : b.h ? <h2 key={k} className="pd-h">{b.h}</h2> : <Figure key={k} slot={b.fig[0]} fb={b.fig[1]} caption={b.fig[2]} kind={kindOf(p.c)} n={fig++} />); })()}
              <h2 className="sub">What to look for</h2>
              <ul className="pd-see">{d.see.map((s, k) => <li key={k}><span className="n">{String(k + 1).padStart(2, "0")}</span>{s}</li>)}</ul>
              <p className="pd-tip"><b>Good to know.</b> {p.t.replace("Recommendation: ", "")}</p>
            </article>
            <aside className="pd-side">
              <dl>
                <div><dt>Best time</dt><dd>{d.best}</dd></div>
                <div><dt>Time to explore</dt><dd>{d.time}</dd></div>
                <div><dt>Distance from Udupi</dt><dd>{p.id === "matha" ? "You are already there" : `About ${dist} km in a straight line; allow more by road`}</dd></div>
                <div><dt>Getting there</dt><dd>{d.reach}</dd></div>
              </dl>
              <p className="prow"><a className="btn solid-ink" href={dirs(p)} target="_blank" rel="noopener">Directions</a><a className="btn line" href={maps(p)} target="_blank" rel="noopener">Open in Maps</a></p>
              <p className="note">Visitor hours, ferry operations and seasonal access are set by each destination. Consult its current visitor information when planning your visit.</p>
            </aside>
          </div>
        </section>

        <section className="sec ink pd-more">
          <div className="wrap">
            <p className="eb">Pairs well with</p>
            <div className="pd-pairs">
              {d.pair.map((k) => { const q = byId(k); return (
                <Link key={k} className="pc" href={`/places/${k}`} data-curtain>
                  <div className="pc-img"><Photo id={photoId(q)} fallback={q.id} kind={kindOf(q.c)} alt="" /></div>
                  <b>{q.n}</b><span>{DET[k].s}</span>
                </Link>); })}
            </div>
            <nav className="pd-pn" aria-label="More places">
              <Link href={`/places/${prev.id}`} data-curtain><small>Previous</small>{prev.n}</Link>
              <Link href="/#places" className="mid" data-curtain>All places</Link>
              <Link href={`/places/${next.id}`} data-curtain><small>Next</small>{next.n}</Link>
            </nav>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

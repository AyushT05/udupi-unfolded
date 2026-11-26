import Link from "next/link";
export const metadata = { title: "Page not found | Udupi, unhurried", robots: { index: false } };
export default function NotFound() {
  return (
    <main className="sec ink fourofour">
      <div className="wrap">
        <p className="eb">404</p>
        <h1>This page is <b>off the map</b></h1>
        <p>The page you requested could not be found. Return to the guide and continue exploring Udupi.</p>
        <Link className="btn" href="/">Back to Udupi</Link>
      </div>
    </main>
  );
}

"use client";
export default function Error({ reset }) {
  return (
    <main className="sec ink fourofour">
      <div className="wrap">
        <p className="eb">Page unavailable</p>
        <h1>We hit a <b>temporary setback</b></h1>
        <p>This page could not be loaded. Try again to continue your visit.</p>
        <button className="btn" onClick={() => reset()}>Try again</button>
      </div>
    </main>
  );
}

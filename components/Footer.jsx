"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { sfxOnce } from "../lib/sfx";
// An engraved, hand-built coastal scene in two layers with the wordmark standing between them.
//   back layer  : sky, a sun that doubles as a Yakshagana headdress disc, drifting clouds, St Mary's basalt columns on the horizon, the far sea, birds
//   Udupi       : the giant wordmark, rising out of the water
//   front layer : a fishing boat under sail, the near waves that break over the letters' feet, floating lamps (Laksha Deepotsava), a temple gopura,
//                 a lighthouse headland with village roofs, rocks with spray, swaying palms
// Everything is plain SVG + CSS keyframes (no per-frame JS), paused while the footer is off screen and switched off for reduced motion.
const W = 1600, H = 900, VB = `0 120 1600 780`, BR = "#8f3420", DK = "#5a1d10", PA = "#f7ead7", CR = "#fff1de";
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => { const x = hex(a), y = hex(b); return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
// One wave line. q then t makes a smooth sine of period p; the closing V/H/Z fills everything below it so rows stack like engraved plates.
const wave = (y, a, p) => { let d = `M${-p} ${y}q${p / 4} ${-a} ${p / 2} 0`; for (let i = 0, n = Math.ceil((2 * (W + 2 * p)) / p); i < n; i++) d += `t${p / 2} 0`; return d + `V${H + 30}H${-p}Z`; };
function Rows({ y0, y1, n, c0, c1, a0, a1, p0, p1, d0, d1, stroke = CR, so = 0.55, sw = 1.6 }) {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1), p = Math.round(p0 + (p1 - p0) * t), y = y0 + (y1 - y0) * t, dur = d0 + (d1 - d0) * t;
    return (
      <g key={i} className="bob" style={{ animationDelay: `${-i * 0.9}s`, animationDuration: `${4 + (i % 3)}s` }}>
        <path className={"wvs" + (i % 2 ? " rev" : "")} d={wave(y, a0 + (a1 - a0) * t, p)} fill={mix(c0, c1, t)} stroke={stroke} strokeOpacity={so} strokeWidth={sw} style={{ "--p": p + "px", animationDuration: dur + "s" }} />
      </g>
    );
  });
}
// A shape with an engraved hatch laid over its fill.
const Sh = ({ d, fill, op = 0.5, id = "ft-h2", sw = 1.6 }) => (<><path d={d} fill={fill} stroke={BR} strokeWidth={sw} strokeLinejoin="round" /><path d={d} fill={`url(#${id})`} opacity={op} /></>);
const Defs = ({ id }) => (
  <defs>
    <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><path d="M0 3H6" stroke={BR} strokeWidth="1.05" strokeOpacity=".8" /></pattern>
    <radialGradient id={id + "g"}><stop offset="0" stopColor="#ffd36b" stopOpacity=".85" /><stop offset="1" stopColor="#ffd36b" stopOpacity="0" /></radialGradient>
  </defs>
);
function Cloud({ y, s = 1, dur, delay, o = 1 }) {
  return (
    <g className="drift" style={{ animationDuration: dur + "s", animationDelay: delay + "s" }} opacity={o}>
      <g transform={`translate(0 ${y}) scale(${s})`}>
        <path d="M0 44q8-30 44-24q14-30 52-10q34-20 64 8q38-6 40 26q-4 14-24 14H22Q-2 58 0 44Z" fill={PA} stroke={BR} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M24 56H170M40 66H150M58 76H130" stroke={BR} strokeWidth="1.2" strokeOpacity=".5" strokeLinecap="round" />
        <path d="M36 38q12-16 30-10M104 32q14-12 30-2" fill="none" stroke={BR} strokeWidth="1.2" strokeOpacity=".55" strokeLinecap="round" />
      </g>
    </g>
  );
}
function Flock({ y, dur, delay, s = 1, n = 5, up = 0 }) {
  const pos = [[0, 0], [38, -16], [38, 16], [78, -30], [78, 32], [118, -44]].slice(0, n);
  return (
    <g className="fly" style={{ animationDuration: dur + "s", animationDelay: delay + "s" }}>
      <g className="lift" style={{ animationDuration: dur / 5 + "s" }}>
        <g transform={`translate(0 ${y})`}>
          {pos.map(([x, yy], i) => (
            <g key={i} transform={`translate(${x * s} ${yy * s}) scale(${s})`}>
              <path className="flap" style={{ animationDelay: `${-i * 0.17 - up}s` }} d="M-15 0Q-7-10 0 0Q7-10 15 0" fill="none" stroke={BR} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </g>))}
        </g>
      </g>
    </g>
  );
}
function Palm({ x, y, s = 1, flip = 1, d = 0, h = 160 }) {
  const fronds = [-172, -142, -112, -80, -48, -18, 14, 42];
  return (
    <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`}>
      <path d={`M0 0C8 ${-h * 0.35} -6 ${-h * 0.65} 10 ${-h}`} fill="none" stroke={BR} strokeWidth="9" strokeLinecap="round" />
      <path d={`M0 0C8 ${-h * 0.35} -6 ${-h * 0.65} 10 ${-h}`} fill="none" stroke={CR} strokeOpacity=".5" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      <g className="sway" style={{ transformOrigin: `10px ${-h}px`, animationDelay: `${d}s` }}>
        {fronds.map((a, i) => <g key={a} transform={`rotate(${a} 10 ${-h})`}><path d={`M10 ${-h}C40 ${-h - 34} 96 ${-h - 30} 128 ${-h + 8}C94 ${-h - 12} 46 ${-h - 12} 10 ${-h}Z`} fill={i % 2 ? BR : DK} stroke={DK} strokeWidth="1.2" /><path d={`M16 ${-h - 2}C52 ${-h - 16} 90 ${-h - 12} 116 ${-h + 2}`} fill="none" stroke={CR} strokeOpacity=".45" strokeWidth="1.2" /></g>)}
        <circle cx="8" cy={-h + 8} r="5" fill={DK} /><circle cx="16" cy={-h + 12} r="5" fill={DK} />
      </g>
    </g>
  );
}
function Gopura({ x, y }) {
  const tiers = Array.from({ length: 6 }, (_, k) => { const hw = 62 - k * 9, y0 = y - 36 - k * 29; return { hw, y0, k }; });
  return (
    <g>
      <Sh d={`M${x - 92} ${y}V${y - 36}H${x + 92}V${y}Z`} fill="#f5dcc0" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${x - 80 + i * 20} ${y}V${y - 34}`} stroke={BR} strokeWidth="2" />)}
      {tiers.map(({ hw, y0, k }) => (
        <g key={k}>
          <Sh d={`M${x - hw} ${y0}H${x + hw}L${x + hw - 6} ${y0 - 29}H${x - hw + 6}Z`} fill={k % 2 ? "#f5dcc0" : PA} />
          <path d={`M${x - hw + 10} ${y0 - 8}H${x + hw - 10}M${x - hw + 14} ${y0 - 18}H${x + hw - 14}`} stroke={BR} strokeWidth="1.3" strokeOpacity=".7" />
          {k < 5 && <path d={`M${x - 8} ${y0}V${y0 - 14}a8 8 0 0 1 16 0V${y0}Z`} fill={DK} />}
        </g>))}
      <Sh d={`M${x - 14} ${y - 214}H${x + 14}L${x + 8} ${y - 234}H${x - 8}Z`} fill="#f5dcc0" />
      <circle cx={x} cy={y - 242} r="7" fill={BR} /><circle cx={x} cy={y - 256} r="5" fill={BR} /><path d={`M${x} ${y - 260}V${y - 284}`} stroke={BR} strokeWidth="2.4" />
      <path className="flag" style={{ transformOrigin: `${x}px ${y - 284}px` }} d={`M${x} ${y - 284}l34 7l-34 8Z`} fill="#f2a93b" stroke={BR} strokeWidth="1.3" />
    </g>
  );
}
function House({ x, y, w, h, rh = 22, d = 0 }) {
  return (
    <g>
      <Sh d={`M${x} ${y}V${y - h}H${x + w}V${y}Z`} fill={PA} sw={1.4} />
      <Sh d={`M${x - 5} ${y - h}L${x + w / 2} ${y - h - rh}L${x + w + 5} ${y - h}Z`} fill={BR} op={0.35} sw={1.4} />
      <rect className="win" style={{ animationDelay: `${d}s` }} x={x + w * 0.3} y={y - h * 0.7} width={w * 0.22} height={h * 0.38} fill="#ffcf5a" stroke={DK} strokeWidth="1.2" />
    </g>
  );
}
function Lamp({ x, y, d }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="lampf" style={{ animationDelay: `${-d}s` }}>
        <g className="bob" style={{ animationDuration: "3.4s", animationDelay: `${-d / 3}s` }}>
          <circle r="30" fill="url(#ft-h2g)" className="glow" style={{ animationDelay: `${-d}s` }} />
          <path d="M-13 0Q0 13 13 0Z" fill={DK} stroke={CR} strokeWidth="1" strokeOpacity=".7" />
          <path className="flick" d="M0-2Q-6-11 0-23Q6-11 0-2Z" fill="#ffd36b" stroke="#fff6d8" strokeWidth="1" />
        </g>
      </g>
    </g>
  );
}
const Foam = ({ x, y, s = 1, d = 0, r = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`}>
    <g className="splash" style={{ animationDelay: `${d}s` }}>
      <path d="M-36 0q12-26 30-6q10-30 32-4q14-20 30 2" fill="none" stroke={CR} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M-30 -2q10-14 24-4q8-16 24-2q12-10 22 4q-24 4-70 2Z" fill={CR} fillOpacity=".55" />
      <circle cx="-14" cy="-26" r="2.6" fill={CR} /><circle cx="10" cy="-34" r="3" fill={CR} /><circle cx="30" cy="-24" r="2.2" fill={CR} />
    </g>
  </g>
);
function Lighthouse({ x = 1430, top = 524, base = 708 }) {
  const hb = 22, ht = 12, hw = (y) => ht + ((hb - ht) * (y - top)) / (base - top);
  const poly = (a, b) => `M${x - hw(a)} ${a}H${x + hw(a)}L${x + hw(b)} ${b}H${x - hw(b)}Z`;
  const bands = [[top, 570], [570, 616], [616, 662], [662, base]];
  return (
    <g>
      <defs>
        <linearGradient id="ft-bmL" gradientUnits="userSpaceOnUse" x1={x} y1="0" x2={x - 240} y2="0"><stop offset="0" stopColor="#fff3c8" stopOpacity=".8" /><stop offset="1" stopColor="#fff3c8" stopOpacity="0" /></linearGradient>
        <linearGradient id="ft-bmR" gradientUnits="userSpaceOnUse" x1={x} y1="0" x2={x + 190} y2="0"><stop offset="0" stopColor="#fff3c8" stopOpacity=".8" /><stop offset="1" stopColor="#fff3c8" stopOpacity="0" /></linearGradient>
      </defs>
      <path className="bm" d={`M${x} 499L${x - 240} 470V528Z`} fill="url(#ft-bmL)" />
      <path className="bm b" d={`M${x} 499L${x + 190} 470V528Z`} fill="url(#ft-bmR)" />
      <Sh d={`M${x - 34} ${base + 6}L${x - 26} ${base - 8}H${x + 26}L${x + 34} ${base + 6}Z`} fill={DK} op={0.3} />
      {bands.map(([a, b], k) => <Sh key={k} d={poly(a, b)} fill={k % 2 ? BR : PA} op={k % 2 ? 0.25 : 0.5} sw={1.4} />)}
      <path d={`M${x - 3.5} ${base - 2}V${base - 20}a3.5 3.5 0 0 1 7 0V${base - 2}Z`} fill={DK} />
      {[594, 640].map((y) => <path key={y} d={`M${x - 3} ${y + 12}V${y + 3}a3 3 0 0 1 6 0V${y + 12}Z`} fill="#ffcf5a" stroke={DK} strokeWidth="1" />)}
      <path d={`M${x - 22} ${top - 6}H${x + 22}V${top + 2}H${x - 22}Z`} fill={DK} />
      {[-18, -9, 0, 9, 18].map((d) => <path key={d} d={`M${x + d} ${top - 6}V${top - 17}`} stroke={DK} strokeWidth="1.6" />)}
      <path d={`M${x - 20} ${top - 17}H${x + 20}`} stroke={DK} strokeWidth="2" />
      <circle className="glow" cx={x} cy="499" r="40" fill="url(#ft-h2g)" />
      <rect x={x - 11} y="490" width="22" height="17" fill="#ffd98a" stroke={DK} strokeWidth="2" />
      <path d={`M${x - 3.7} 490V507M${x + 3.7} 490V507`} stroke={DK} strokeWidth="1.2" />
      <path d={`M${x - 14} 490Q${x} 468 ${x + 14} 490Z`} fill={BR} stroke={DK} strokeWidth="1.4" /><path d={`M${x} 470V460`} stroke={DK} strokeWidth="2" /><circle cx={x} cy="459" r="3" fill={DK} />
    </g>
  );
}
function Fisherman({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-3 0L-2 -20M4 0L3 -20" stroke={DK} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M0 -20L-1 -36" stroke={DK} strokeWidth="6.5" strokeLinecap="round" />
      <circle cx="-1" cy="-41" r="4.5" fill={DK} /><path d="M-10 -43L-1 -56L8 -43Z" fill={BR} stroke={DK} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M-1 -33L12 -41L24 -34" fill="none" stroke={DK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <g className="cast" style={{ transformOrigin: "24px -34px" }}>
        <path d="M24 -34C42 -58 72 -54 88 -30" fill="none" stroke={CR} strokeWidth="2" strokeLinecap="round" />
        <path d="M24 -34L44 -50M24 -34L58 -52M24 -34L74 -48M24 -34L88 -30" stroke={CR} strokeWidth="1.1" strokeOpacity=".75" />
        <path d="M40 -49Q52 -36 62 -44M54 -52Q64 -36 76 -44" fill="none" stroke={CR} strokeWidth="1" strokeOpacity=".6" />
        {[[44, -50], [58, -52], [74, -48], [88, -30]].map(([a, b]) => <circle key={a} cx={a} cy={b} r="1.8" fill={CR} />)}
      </g>
    </g>
  );
}
function Ghats() {
  const f = mix("#efc79f", BR, 0.2);
  return (
    <g opacity=".6">
      <path d="M0 526V490C40 474 85 456 130 464C175 444 220 436 262 456C292 466 312 492 330 526Z" fill={f} />
      <path d="M1000 526C1040 500 1090 488 1140 470C1190 452 1230 440 1290 456C1340 440 1400 430 1450 450C1500 458 1550 470 1600 466V526Z" fill={f} />
      <path d="M0 526V490C40 474 85 456 130 464C175 444 220 436 262 456C292 466 312 492 330 526Z" fill="url(#ft-h1)" opacity=".3" />
      <path d="M1000 526C1040 500 1090 488 1140 470C1190 452 1230 440 1290 456C1340 440 1400 430 1450 450C1500 458 1550 470 1600 466V526Z" fill="url(#ft-h1)" opacity=".3" />
    </g>
  );
}
function BoatShape() {
  return (
      <g className="rock">
        <path d="M-96 -34C-70 -8 -40 0 0 0C40 0 76 -6 102 -38L92 -40C62 -24 -52 -24 -90 -40Z" fill={PA} stroke={BR} strokeWidth="3" strokeLinejoin="round" />
        <path d="M-84 -30C-50 -16 56 -16 88 -32" fill="none" stroke="#f2a93b" strokeWidth="5" strokeLinecap="round" />
        <Sh d="M-30 -30V-58H22V-30Z" fill="#f2a93b" sw={2.2} />
        <path d="M0 -30V-160" stroke={BR} strokeWidth="5" strokeLinecap="round" />
        <Sh d="M6 -154V-52H80Z" fill={PA} op={0.5} sw={2.4} />
        <Sh d="M-6 -140V-56H-64Z" fill="#f2a93b" op={0.35} sw={2.4} />
        <path className="flag" style={{ transformOrigin: "0px -160px" }} d="M0 -160l28 6l-28 9Z" fill={BR} stroke={BR} strokeWidth="1.2" />
      </g>
  );
}
const Boat = () => <g className="sail"><BoatShape /></g>;
const FarBoat = ({ y, sc, dur, delay }) => <g transform={`translate(0 ${y}) scale(${sc})`}><g className="fsail" style={{ animationDuration: dur + "s", animationDelay: delay + "s" }}><BoatShape /></g></g>;
const COLS = [30, 44, 52, 38, 58, 46, 40, 54, 36, 48, 32, 24];
function Basalt({ x, y }) {
  return (
    <g>
      <path d={`M${x - 20} ${y + 2}Q${x + 30} ${y - 16} ${x + 80} ${y - 10}Q${x + 150} ${y - 18} ${x + 200} ${y + 2}Z`} fill={mix("#efc79f", BR, 0.35)} />
      {COLS.map((h, i) => <g key={i}><path d={`M${x + i * 14} ${y}V${y - h}l7-4l7 4V${y}Z`} fill={mix("#efc79f", BR, 0.5)} stroke={BR} strokeWidth="1.1" strokeLinejoin="round" /><path d={`M${x + i * 14 + 7} ${y - h - 4}V${y}`} stroke={BR} strokeOpacity=".55" strokeWidth="1" /></g>)}
    </g>
  );
}
function Sun() {
  const cx = 1060, cy = 380, petals = 26;
  return (
    <g>
      <circle cx={cx} cy={cy} r="210" fill="#f2a93b" fillOpacity=".16" className="pulse" />
      <g className="spin" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2, r0 = 186, r1 = i % 2 ? 206 : 226; return <path key={i} d={`M${cx + Math.cos(a) * r0} ${cy + Math.sin(a) * r0}L${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1}`} stroke={BR} strokeWidth="1.6" strokeLinecap="round" strokeOpacity=".7" />; })}
      </g>
      <g className="spin rev2" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {Array.from({ length: petals }, (_, i) => { const a = (i / petals) * 360; return <ellipse key={i} cx={cx} cy={cy - 158} rx="13" ry="26" transform={`rotate(${a} ${cx} ${cy})`} fill="#f7dcb4" stroke={BR} strokeWidth="1.5" />; })}
      </g>
      <circle cx={cx} cy={cy} r="140" fill="#f2a93b" stroke={BR} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="140" fill="url(#ft-h1)" opacity=".28" />
      <circle cx={cx} cy={cy} r="122" fill="none" stroke={BR} strokeWidth="5" strokeDasharray="0.5 10" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="96" fill="#f7c577" stroke={BR} strokeWidth="1.6" />
      <g className="spin" style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: "90s" }}>
        {Array.from({ length: 12 }, (_, i) => <path key={i} transform={`rotate(${i * 30} ${cx} ${cy})`} d={`M${cx} ${cy - 90}q16 22 0 46q-16-24 0-46Z`} fill="#f2a93b" stroke={BR} strokeWidth="1.3" />)}
      </g>
      <circle cx={cx} cy={cy} r="34" fill={BR} /><circle cx={cx} cy={cy} r="22" fill="#f7c577" stroke={PA} strokeWidth="1.5" /><circle cx={cx} cy={cy} r="8" fill={BR} />
    </g>
  );
}
function Glitter() {
  return Array.from({ length: 11 }, (_, i) => { const w = 150 - i * 9 + (i % 2) * 22; return <path key={i} className="gl" style={{ animationDelay: `${-i * 0.37}s`, transformOrigin: `1060px ${536 + i * 17}px` }} d={`M${1060 - w / 2} ${536 + i * 17}h${w}`} stroke={CR} strokeWidth={3 - i * 0.12} strokeLinecap="round" />; });
}
function Mark() {
  const ref = useRef(null), wr = useRef([]);
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current, st = [0, 0, 0, 0, 0]; let raf = 0, px = -1e4, py = -1e4, on = false;
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; }); io.observe(el);
    const tick = () => {
      raf = 0; let again = false; const b = el.getBoundingClientRect();
      wr.current.forEach((s, i) => {
        if (!s) return;
        const cx = b.left + s.offsetLeft + s.offsetWidth / 2, cy = b.top + s.offsetTop + s.offsetHeight / 2, t = on ? Math.max(0, 1 - Math.hypot(px - cx, (py - cy) * 0.7) / 420) : 0;
        st[i] += (t - st[i]) * 0.13; if (Math.abs(t - st[i]) > 0.003) again = true; else st[i] = t;
        s.style.fontVariationSettings = `"ROND" ${Math.round(100 - st[i] * 100)}`; s.style.translate = `0 ${(-st[i] * 0.07).toFixed(3)}em`; s.style.color = `color-mix(in srgb, var(--lamp) ${Math.round(st[i] * 100)}%, var(--brick))`;
      });
      if (again) raf = requestAnimationFrame(tick);
    };
    const mv = (e) => { px = e.clientX; py = e.clientY; if (on && !raf) raf = requestAnimationFrame(tick); };
    addEventListener("pointermove", mv, { passive: true });
    return () => { removeEventListener("pointermove", mv); cancelAnimationFrame(raf); io.disconnect(); };
  }, []);
  return (
    <p className="mark" ref={ref} aria-hidden="true">
      {[..."Udupi"].map((c, i) => <span className="mch" key={i} ref={(n) => { wr.current[i] = n; }}><motion.span initial={{ y: "108%" }} whileInView={{ y: 0 }} onViewportEnter={() => { if (i === 0) sfxOnce("footer-reveal"); }} viewport={{ once: true, margin: "0px 0px -8% 0px" }} transition={{ duration: 1.5, delay: 0.25 + i * 0.09, ease: [0.2, 0.7, 0.2, 1] }}>{c}</motion.span></span>)}
    </p>
  );
}
const NAV = [["Places", "#places"], ["Map", "#map"], ["Food", "#food"], ["Stay", "#stay"], ["Plan", "#plan"], ["Guide", "#guide"], ["Season", "#when"]];
export function Footer() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current, io = new IntersectionObserver(([e]) => el.classList.toggle("live", e.isIntersecting), { rootMargin: "10% 0px 10% 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <footer className="sfoot">
      <div className="fscene" ref={ref}>
        <svg className="layer" viewBox={VB} preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
          <Defs id="ft-h1" />
          <defs>
            <linearGradient id="ft-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f8ecda" /><stop offset=".55" stopColor="#f4d9b5" /><stop offset="1" stopColor="#edb98a" /></linearGradient>
            <linearGradient id="ft-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#efc79f" /><stop offset="1" stopColor="#c8764b" /></linearGradient>
            <pattern id="ft-ln" width="8" height="7" patternUnits="userSpaceOnUse"><path d="M0 3.5H8" stroke={BR} strokeOpacity=".09" strokeWidth="1" /></pattern>
          </defs>
          <rect width={W} height="540" fill="url(#ft-sky)" /><rect width={W} height="540" fill="url(#ft-ln)" />
          <Sun />
          <Cloud y={150} s={1.2} dur={150} delay={-30} /><Cloud y={250} s={0.8} dur={190} delay={-120} o={0.9} /><Cloud y={345} s={1} dur={170} delay={-70} o={0.85} /><Cloud y={190} s={0.65} dur={210} delay={-170} o={0.8} />
          <Ghats />
          <path d={`M0 524C140 512 250 520 330 516C400 512 520 514 640 520C760 512 880 518 980 516C1100 512 1240 520 1400 514C1480 512 1560 516 1600 518V560H0Z`} fill={mix("#efc79f", BR, 0.22)} />
          <Basalt x={330} y={528} />
          <rect y="520" width={W} height={H - 520} fill="url(#ft-sea)" />
          <Rows y0={536} y1={762} n={10} c0="#efc79f" c1="#cf8057" a0={2} a1={6} p0={110} p1={210} d0={30} d1={14} />
          <Glitter />
          <FarBoat y={548} sc={0.3} dur={170} delay={-70} /><FarBoat y={534} sc={0.2} dur={230} delay={-190} />
          <Flock y={225} dur={46} delay={-14} s={1.5} n={5} /><Flock y={310} dur={62} delay={-30} s={1.1} n={4} up={0.4} /><Flock y={175} dur={74} delay={-50} s={0.9} n={3} up={0.8} />
        </svg>
        <Mark />
        <svg className="layer" viewBox={VB} preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
          <Defs id="ft-h2" />
          <g transform="translate(0 794)"><Boat /></g>
          <Rows y0={772} y1={890} n={7} c0="#c2693f" c1="#6b2412" a0={7} a1={15} p0={190} p1={320} d0={20} d1={11} so={0.6} sw={2} />
          {[[560, 800, 0], [760, 832, 9], [930, 792, 18], [1090, 846, 27], [420, 846, 33]].map(([x, y, d]) => <Lamp key={x} x={x} y={y} d={d} />)}
          {/* left headland, gopura, rocks */}
          <path d="M0 900V776C60 760 130 752 210 756C270 760 310 786 352 806C392 826 430 850 482 878L520 900Z" fill={BR} stroke={DK} strokeWidth="2" />
          <path d="M0 900V776C60 760 130 752 210 756C270 760 310 786 352 806C392 826 430 850 482 878L520 900Z" fill="url(#ft-h2)" opacity=".6" />
          <path d="M0 776C60 760 130 752 210 756C270 760 310 786 352 806" fill="none" stroke="#f2a93b" strokeWidth="3" strokeOpacity=".7" />
          <Gopura x={150} y={762} />
          <Palm x={300} y={790} s={0.9} flip={-1} d={-1} h={150} /><Fisherman x={400} y={836} s={1.5} />
          <Foam x={450} y={868} d={0} /><Foam x={520} y={892} s={1.2} d={-1.6} />
          {/* right headland, lighthouse, roofs */}
          <path d="M1120 900V812C1160 790 1230 778 1290 752C1340 730 1390 708 1440 698C1500 686 1560 680 1600 668V900Z" fill={BR} stroke={DK} strokeWidth="2" />
          <path d="M1120 900V812C1160 790 1230 778 1290 752C1340 730 1390 708 1440 698C1500 686 1560 680 1600 668V900Z" fill="url(#ft-h2)" opacity=".6" />
          <path d="M1120 812C1160 790 1230 778 1290 752C1340 730 1390 708 1440 698C1500 686 1560 680 1600 668" fill="none" stroke="#f2a93b" strokeWidth="3" strokeOpacity=".7" />
          <Lighthouse />
          <House x={1484} y={696} w={46} h={30} d={-0.8} /><House x={1540} y={689} w={40} h={26} rh={18} d={-2.2} /><House x={1512} y={690} w={32} h={22} rh={16} d={-3.5} />
          <Palm x={1318} y={754} s={0.8} d={-1.2} h={150} /><Palm x={1584} y={686} s={0.7} flip={-1} d={-3} h={140} />
          <Foam x={1180} y={826} s={1.1} d={-0.6} /><Foam x={1250} y={792} s={0.8} d={-2.4} r={-14} /><Foam x={1140} y={868} s={1.3} d={-3.4} />
        </svg>
      </div>
      <div className="fbar">
        <div className="wrap fbar-in">
          <p className="fine">An independent guide to Udupi district. Travel information is editorial; opening arrangements, seasonal services and festival dates are subject to change.</p>
          <nav aria-label="Footer"><ul>{NAV.map(([t, h]) => <li key={t}><a href={h}>{t}</a></li>)}</ul></nav>
          <button className="totop" onClick={() => { scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }}>Back to top <span aria-hidden="true">↑</span></button>
        </div>
      </div>
    </footer>
  );
}

// Art-directed placeholder used while a photo is missing or loading. One palette, shapes vary by kind,
// so a missing photo reads as intentional illustration rather than a flat coloured box.
const SHAPES = {
  beach: <><circle cx="290" cy="318" r="52" fill="#f6c36a" opacity=".92" /><rect y="332" width="400" height="168" fill="url(#sea)" /><path d="M0 380q50-14 100 0t100 0 100 0 100 0M0 430q50-14 100 0t100 0 100 0 100 0" stroke="#f1ead9" strokeOpacity=".25" fill="none" strokeWidth="2" /></>,
  island: <><rect y="340" width="400" height="160" fill="url(#sea)" /><g fill="#04161b">{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={70 + i * 32} y={300 - ((i * 37) % 5) * 16} width="28" height={80 + ((i * 37) % 5) * 16} />)}</g><circle cx="300" cy="150" r="40" fill="#f6c36a" opacity=".85" /></>,
  temple: <><circle cx="200" cy="210" r="120" fill="#f6c36a" opacity=".28" /><g fill="#04161b"><rect x="90" y="400" width="220" height="100" /><rect x="110" y="350" width="180" height="50" /><rect x="130" y="305" width="140" height="45" /><rect x="152" y="265" width="96" height="40" /><rect x="172" y="230" width="56" height="35" /><path d="M200 175l14 55h-28z" /><rect x="198" y="150" width="4" height="30" /></g></>,
  heritage: <><circle cx="110" cy="190" r="44" fill="#f6c36a" opacity=".8" /><g fill="#04161b"><path d="M20 430l90-90 90 90zM170 430l110-110 110 110z" /><rect x="0" y="430" width="400" height="70" /></g><g fill="#f6c36a" opacity=".7"><rect x="92" y="400" width="14" height="20" /><rect x="260" y="395" width="14" height="22" /></g></>,
  culture: <><circle cx="200" cy="230" r="130" fill="#f6c36a" opacity=".22" /><g fill="#04161b"><path d="M120 330l30-120 50 40 50-40 30 120z" /><rect x="110" y="330" width="180" height="40" rx="6" /><rect x="150" y="370" width="100" height="130" /></g><g fill="#f6c36a" opacity=".85"><circle cx="175" cy="300" r="9" /><circle cx="225" cy="300" r="9" /></g></>,
  food: <><circle cx="200" cy="270" r="130" fill="#04161b" opacity=".35" /><circle cx="200" cy="270" r="96" fill="none" stroke="#f6c36a" strokeWidth="3" opacity=".8" /><circle cx="200" cy="270" r="60" fill="#f6c36a" opacity=".85" /></>,
};
export default function Scene({ kind = "beach" }) {
  return (
    <svg className="scene" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#082a33" /><stop offset=".6" stopColor="#1d5f66" /><stop offset="1" stopColor="#d98d3a" /></linearGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f7c80" /><stop offset="1" stopColor="#06222a" /></linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#sky)" />
      {SHAPES[kind] || SHAPES.beach}
    </svg>
  );
}
export const kindOf = (c) => ({ temple: "temple", beach: "beach", island: "island", heritage: "heritage", nature: "beach", food: "food", culture: "culture" }[c] || "beach");

"use client";
import { useEffect, useState } from "react";
let cache;
export default function useCredits() {
  const [c, setC] = useState(cache || {});
  useEffect(() => { if (cache) return; fetch("/img/credits.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then((j) => { cache = j; setC(j); }); }, []);
  return c;
}

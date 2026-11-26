"use client";
import { useEffect, useRef, useState } from "react";
import Scene from "./Scene";
// Shows public/img/<id>.jpg over an illustrated Scene. If the file is absent it tries `fallback`,
// then keeps the scene. hideIfMissing renders nothing when neither exists.
export default function Photo({ id, fallback, alt = "", kind = "beach", priority = false, hideIfMissing = false, scene = "always", className = "" }) {
  const [cur, setCur] = useState(id), [st, setSt] = useState("load"), ref = useRef(null);
  useEffect(() => { setCur(id); }, [id]);
  useEffect(() => { const im = ref.current; if (im?.complete) { if (im.naturalWidth) setSt("ok"); else err(); } else setSt("load"); }, [cur]); // eslint-disable-line react-hooks/exhaustive-deps
  const err = () => (cur === id && fallback && fallback !== id ? setCur(fallback) : setSt("err"));
  if (hideIfMissing && st === "err") return null;
  return (
    <div className={"ph grain " + className}>
      {(scene === "always" ? st !== "ok" : st === "err") && <Scene kind={kind} />}
      <img ref={ref} src={`/img/${cur}.jpg`} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" draggable="false" style={{ opacity: st === "ok" ? 1 : 0 }} onLoad={() => setSt("ok")} onError={err} />
    </div>
  );
}

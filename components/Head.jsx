"use client";
import { Children, cloneElement, isValidElement } from "react";
import { motion } from "framer-motion";
const E = [0.23, 1, 0.32, 1];
const par = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const word = { hidden: { y: "108%" }, show: { y: "0%", transition: { duration: 0.95, ease: E } } };
const text = (n) => Children.toArray(n).map((c) => (typeof c === "string" ? c : isValidElement(c) ? text(c.props.children) : "")).join("");
// Splits a heading into words that rise out of their own mask, one after another, once, when the heading enters the viewport.
function split(node, base = "w") {
  return Children.map(node, (c, i) => {
    if (typeof c === "string") return c.split(/(\s+)/).map((t, j) => (/^\s+$/.test(t) ? " " : t ? <span className="w" key={`${base}${i}-${j}`}><motion.span className="wi" variants={word}>{t}</motion.span></span> : null));
    if (isValidElement(c)) return cloneElement(c, { key: `${base}${i}` }, split(c.props.children, `${base}${i}-`));
    return c;
  });
}
export default function Head({ n, label, children, lede }) {
  return (
    <div className="head">
      <p className="eb">{n} · {label}</p>
      <motion.h2 className="h2" aria-label={text(children)} variants={par} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -12% 0px" }}>{split(children)}</motion.h2>
      {lede && <motion.p className="lede" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -8% 0px" }} transition={{ duration: 0.9, delay: 0.25, ease: E }}>{lede}</motion.p>}
    </div>
  );
}

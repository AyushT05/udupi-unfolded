"use client";
import { motion } from "framer-motion";
// Fades each route in. The curtain in components/Curtain.jsx handles the first load.
export default function Template({ children }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>{children}</motion.div>;
}

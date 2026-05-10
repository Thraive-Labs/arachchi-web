"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

export function ReadingProgress() {
  const raw = useMotionValue(0);
  const smoothed = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.5 });
  const width = useTransform(smoothed, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    function update() {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      raw.set(total > 0 ? scrolled / total : 0);
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [raw]);

  return (
    <motion.div
      style={{ width }}
      className="fixed top-0 left-0 z-[100] h-[2px] bg-foreground origin-left"
      aria-hidden="true"
    />
  );
}

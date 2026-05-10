"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIZE_ROWS = [
  { size: "XS",  eu: "32", uk: "4",  chest: "82–85",   waist: "63–66",  hips: "89–92"   },
  { size: "S",   eu: "34", uk: "6",  chest: "86–89",   waist: "67–70",  hips: "93–96"   },
  { size: "M",   eu: "36", uk: "8",  chest: "90–93",   waist: "71–74",  hips: "97–100"  },
  { size: "L",   eu: "38", uk: "10", chest: "94–97",   waist: "75–78",  hips: "101–104" },
  { size: "XL",  eu: "40", uk: "12", chest: "98–101",  waist: "79–82",  hips: "105–108" },
  { size: "XXL", eu: "42", uk: "14", chest: "102–105", waist: "83–86",  hips: "109–112" },
];

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto scrollbar-none bg-background shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            aria-label="Size guide"
          >
            <div className="p-8">
              <div className="mb-8 flex items-center justify-between">
                <p className="text-xs tracking-[0.2em] uppercase text-foreground">Size guide</p>
                <button
                  onClick={onClose}
                  aria-label="Close size guide"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                All measurements are in centimetres. Measure over light undergarments for best results.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {["Size", "EU", "UK", "Chest", "Waist", "Hips"].map((h) => (
                        <th key={h} className="pb-3 pr-4 text-left font-normal tracking-[0.1em] uppercase text-foreground last:pr-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {SIZE_ROWS.map((row) => (
                      <tr key={row.size}>
                        <td className="py-3 pr-4 font-medium text-foreground">{row.size}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{row.eu}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{row.uk}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{row.chest}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{row.waist}</td>
                        <td className="py-3 text-muted-foreground">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 space-y-4">
                <p className="text-xs tracking-[0.15em] uppercase text-foreground">How to measure</p>
                <dl className="space-y-4">
                  {[
                    { label: "Chest", desc: "Measure around the fullest part of your chest, tape parallel to the floor." },
                    { label: "Waist", desc: "Measure around your natural waistline at the narrowest point of your torso." },
                    { label: "Hips",  desc: "Measure around the fullest part of your hips, approximately 20 cm below the waist." },
                  ].map(({ label, desc }) => (
                    <div key={label}>
                      <dt className="mb-0.5 text-xs text-foreground">{label}</dt>
                      <dd className="text-sm leading-relaxed text-muted-foreground">{desc}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

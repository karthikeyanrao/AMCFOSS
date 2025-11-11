import React from "react";
import { motion } from "framer-motion";

const toggleOptions = [
  { id: "car", label: "Car", icon: "🚗" },
  { id: "default", label: "Dot", icon: "●" },
];

export default function CursorToggle({ mode = "car", onChange, isMobile }) {
  if (isMobile) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] hidden lg:block">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-[#060b17]/90 px-3 py-2 text-white shadow-xl backdrop-blur"
      >
        {toggleOptions.map((option) => {
          const active = mode === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange?.(option.id)}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                active
                  ? "bg-gradient-to-r from-emerald-500 via-brand-500 to-indigo-500 text-white shadow-inner shadow-emerald-500/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span className="text-base">{option.icon}</span>
              {option.label}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}



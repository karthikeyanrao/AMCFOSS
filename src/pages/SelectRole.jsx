import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const cards = [
  {
    id: "mentor",
    title: "Mentor",
    accent: "Guide contributors, assign tasks, and track execution.",
    points: ["Task assignment", "Progress snapshots", "Mentor insights"],
    gradient: "from-[#00ff88]/40 to-[#2ecc71]/40",
  },
  {
    id: "office_bearer",
    title: "Office Bearer",
    accent: "Design events, manage registrations, and broadcast updates.",
    points: ["Event lifecycle", "Registrations", "Community updates"],
    gradient: "from-[#2ecc71]/40 to-[#27ae60]/40",
  },
];

export default function SelectRole() {
  const { user, role, saveRole, loading } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(role || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
      return;
    }
    // If user already has a role, auto-redirect to their dashboard
    if (!loading && user && role) {
      if (role === "mentor") {
        navigate("/mentor", { replace: true });
      } else if (role === "office_bearer") {
        navigate("/office", { replace: true });
      }
    }
  }, [user, role, loading, navigate]);

  const onSave = async () => {
    if (!selected || !user) return;
    setSaving(true);
    await saveRole(user.uid, selected);
    setSaving(false);
    navigate(selected === "mentor" ? "/mentor" : "/office", { replace: true });
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-sm text-slate-400">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04070f] text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,136,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(46,204,113,0.12),transparent_45%)]" />
        <div className="absolute -left-24 top-10 h-[26rem] w-[26rem] rounded-full bg-[#00ff88]/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#2ecc71]/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-16">
        <div className="mb-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl font-semibold text-white"
          >
            Choose your impact lane.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mt-3 text-base text-slate-300"
          >
            Tailor the dashboard experience based on how you contribute to AMC FOSS.
          </motion.p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {cards.map((card, idx) => {
            const isActive = selected === card.id;
            return (
              <motion.button
                key={card.id}
                type="button"
                onClick={() => setSelected(card.id)}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`group relative overflow-hidden rounded-3xl border ${
                  isActive ? "border-[#00ff88]/70" : "border-white/10 hover:border-white/20"
                } bg-white/[0.04] p-8 text-left shadow-2xl backdrop-blur transition`}
              >
                <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${card.gradient} opacity-40`} />
                <div
                  className={`absolute right-[-40%] top-[-40%] h-56 w-56 rounded-full bg-white/10 blur-3xl transition group-hover:scale-110 ${
                    isActive ? "opacity-70" : "opacity-40"
                  }`}
                />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[#00ff88]">
                    {idx === 0 ? "Guide" : "Orchestrate"}
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-white">{card.title}</h2>
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-lg transition ${
                        isActive ? "bg-[#00ff88]/20 text-[#00ff88]" : "bg-white/5 text-slate-200 group-hover:bg-white/10"
                      }`}
                    >
                      {idx === 0 ? "🛠️" : "📣"}
                    </span>
                  </div>
                  <p className="mb-5 text-sm text-slate-300/90">{card.accent}</p>
                  <ul className="space-y-2 text-xs font-medium text-slate-300/80">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#00ff88]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          onClick={onSave}
          disabled={!selected || saving}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="group relative mt-10 inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#00ff88] via-[#2ecc71] to-[#27ae60] px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#1a1a2e] shadow-xl shadow-[#00ff88]/30 transition focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 font-bold"
        >
          <span className="absolute inset-0 translate-x-[-100%] bg-white/20 transition duration-300 group-hover:translate-x-0" />
          <span className="relative">{saving ? "Saving..." : "Save & Continue"}</span>
        </motion.button>
      </div>
    </div>
  );
}



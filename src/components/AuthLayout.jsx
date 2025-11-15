import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050910] text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,136,0.10),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(46,204,113,0.12),transparent_45%)]" />
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[#2ecc71]/30 blur-3xl" />
        <div className="absolute -bottom-36 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#00ff88]/30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
        <header className="mb-10 flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-3 text-lg font-semibold tracking-wide">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00ff88] to-[#2ecc71] text-xl shadow-lg shadow-[#00ff88]/20 transition group-hover:scale-105">
              ⚙️
            </span>
            <span className="flex flex-col leading-tight">
              <span className="uppercase text-xs font-semibold tracking-[0.4em] text-slate-400">AMC FOSS</span>
              <span className="text-[#00ff88] group-hover:text-[#2ecc71]">Open Source Collective</span>
            </span>
          </Link>
          <Link
            to="/events"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-[#00ff88]/60 hover:text-[#00ff88]"
          >
            View Events
          </Link>
        </header>

        <div className="grid flex-1 gap-10 pb-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative hidden overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl lg:flex"
          >
            <div className="absolute -left-12 -top-24 h-64 w-64 rounded-full bg-[#2ecc71]/30 blur-3xl" />
            <div className="absolute -right-16 -bottom-24 h-80 w-80 rounded-full bg-[#00ff88]/25 blur-3xl" />
            <div className="relative z-10 flex flex-col justify-end">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-[#00ff88]">
                Built with passion
              </span>
              <h2 className="mb-4 text-4xl font-semibold leading-tight text-white">
                Collaborate, innovate, and ship open source experiences.
              </h2>
              <p className="max-w-md text-sm text-slate-300/90">
                Access role-based dashboards, plan community events, and track tasks within a single open source hub.
                Every contributor gets tools tailored to their responsibilities.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { title: "Mentor Suite", desc: "Assign tasks, follow progress, unlock impact." },
                  { title: "Event Studio", desc: "Design, launch, and manage club events." },
                  { title: "Community Pulse", desc: "Stay in sync with registrations and updates." },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200/90 backdrop-blur"
                  >
                    <div className="mb-2 text-[#00ff88]">{item.title}</div>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="relative flex flex-col justify-center"
          >
            <div className="absolute inset-0 rounded-[2.5rem] bg-white/4 blur-3xl" />
            <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#060b17]/90 p-10 shadow-2xl backdrop-blur">
              <div className="mb-6">
                <h1 className="text-3xl font-semibold text-white">{title}</h1>
                {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
              </div>
              {children}
              {footer ? <div className="mt-8 text-sm text-slate-400">{footer}</div> : null}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}



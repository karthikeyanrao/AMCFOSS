import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";

export default function MentorDashboard() {
  const { user, logout } = useAuth();
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const tasksRef = useMemo(() => collection(db, "tasks"), []);

  const loadTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(tasksRef, where("createdBy", "==", user.uid));
      const snap = await getDocs(q);
      setMyTasks(
        snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !user) return;
    await addDoc(tasksRef, {
      title: taskTitle,
      assignedTo: taskAssignee || null,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });
    setTaskTitle("");
    setTaskAssignee("");
    await loadTasks();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03060d] text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(16,185,129,0.24),transparent_50%)]" />
        <div className="absolute -left-28 bottom-10 h-[28rem] w-[28rem] rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="absolute -right-32 top-0 h-[26rem] w-[26rem] rounded-full bg-brand-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-16 lg:px-12">
        <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-white">Mentor Command Deck</h1>
            <p className="mt-2 text-sm text-slate-300">
              Build momentum with structured task assignments and real-time status tracking.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300 transition hover:border-emerald-400/50 hover:text-emerald-200"
            >
              Go to Home
            </Link>
            <button
              onClick={logout}
              className="self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300 transition hover:border-emerald-400/50 hover:text-emerald-200"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur"
          >
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-br from-emerald-500/25 via-brand-500/20 to-indigo-500/15 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-emerald-200/80">
                  Mentor Profile
                </span>
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/90">
                  Live
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200/90">
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Name</div>
                  <div className="mt-2 text-lg font-semibold text-white">{user?.displayName || "Mentor"}</div>
                  <p className="mt-2 text-xs text-slate-400/90">
                    Encourage contributors, curate tasks, and unlock new iterations together.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200/90">
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Contact</div>
                  <div className="mt-2 text-lg font-semibold text-white">{user?.email}</div>
                  <div className="mt-3 text-xs text-slate-400">
                    Mentor ID: <span className="text-emerald-200">{user?.uid?.slice(0, 8)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#070b18]/95 p-8 shadow-2xl backdrop-blur"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-brand-500/10 to-indigo-500/15 opacity-60" />
            <div className="relative z-10">
              <h2 className="text-xl font-semibold text-white">Create Mentor Task</h2>
              <p className="mt-2 text-xs text-slate-400">
                Outline clear deliverables and optionally assign to a specific mentee.
              </p>
              <form onSubmit={addTask} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Task Title</label>
                  <input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Ship UI polish for landing hero"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:bg-white/15 focus:ring-2 focus:ring-emerald-400/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Assign to (optional)</label>
                  <input
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    placeholder="contributor@amrita.edu"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:bg-white/15 focus:ring-2 focus:ring-emerald-400/40"
                  />
                </div>
                <button
                  className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-brand-500 to-indigo-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40"
                >
                  <span className="absolute inset-0 translate-y-full bg-white/20 transition duration-300 group-hover:translate-y-0" />
                  <span className="relative">Publish Task</span>
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Active Task Log</h3>
              <p className="text-xs text-slate-400">All tasks created by you are logged with live status.</p>
            </div>
            {loading ? <span className="text-xs uppercase tracking-[0.35em] text-emerald-200/90">Refreshing…</span> : null}
          </div>
          <div className="mt-6 space-y-4">
            {myTasks.length === 0 && !loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-slate-300">
                No tasks created yet. Share your first mission with the team!
              </div>
            ) : null}
            {myTasks.map((task) => (
              <div
                key={task.id}
                className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 transition hover:border-emerald-300/40 hover:bg-white/10 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="text-lg font-medium text-white">{task.title}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    Assigned to:{" "}
                    <span className="text-emerald-200/90">{task.assignedTo || "Awaiting assignee"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.3em]">
                    {task.id.slice(0, 6)}
                  </span>
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-emerald-200/80">
                    In progress
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}



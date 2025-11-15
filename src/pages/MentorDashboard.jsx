import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { addDoc, collection, getDocs, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";

export default function MentorDashboard() {
  const { user, logout } = useAuth();
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskFormsLink, setTaskFormsLink] = useState("");
  const [taskDomain, setTaskDomain] = useState("");
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Mentor profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [mentorName, setMentorName] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [mentorRollNo, setMentorRollNo] = useState("");
  const [mentorDomain, setMentorDomain] = useState("");
  const [mentorProfile, setMentorProfile] = useState(null);

  const tasksRef = useMemo(() => collection(db, "tasks"), []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      // Load ALL tasks from all mentors
      const snap = await getDocs(tasksRef);
      const tasksList = snap.docs.map((docSnap) => {
        const taskData = { id: docSnap.id, ...docSnap.data() };
        // Check if deadline has passed
        const now = new Date().getTime();
        const deadline = taskData.deadline ? new Date(taskData.deadline).getTime() : null;
        const isEnded = deadline ? now > deadline : false;
        return {
          ...taskData,
          isEnded,
        };
      });
      setAllTasks(tasksList);
    } finally {
      setLoading(false);
    }
  };

  const loadMentorProfile = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const profileData = snap.data();
        setMentorProfile(profileData);
        setMentorName(profileData.name || user.displayName || "");
        setMentorEmail(profileData.email || user.email || "");
        setMentorRollNo(profileData.rollNo || "");
        setMentorDomain(profileData.domain || "");
      } else {
        // Initialize with user data
        setMentorName(user.displayName || "");
        setMentorEmail(user.email || "");
        setMentorRollNo("");
        setMentorDomain("");
      }
    } catch (error) {
      console.error("Failed to load mentor profile", error);
    }
  };

  useEffect(() => {
    loadTasks();
    loadMentorProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDomain.trim() || !taskDeadline || !taskFormsLink.trim() || !user) return;
    await addDoc(tasksRef, {
      title: taskTitle,
      deadline: taskDeadline,
      formsLink: taskFormsLink,
      domain: taskDomain,
      createdBy: user.uid,
      createdByName: mentorName || user.displayName || user.email || "Mentor",
      createdAt: serverTimestamp(),
    });
    setTaskTitle("");
    setTaskDeadline("");
    setTaskFormsLink("");
    setTaskDomain("");
    await loadTasks();
  };

  const saveMentorProfile = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        name: mentorName,
        email: mentorEmail,
        rollNo: mentorRollNo,
        domain: mentorDomain,
        role: "mentor",
      }, { merge: true });
      setIsEditingProfile(false);
      await loadMentorProfile();
    } catch (error) {
      console.error("Failed to save mentor profile", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03060d] text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,136,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(46,204,113,0.12),transparent_50%)]" />
        <div className="absolute -left-28 bottom-10 h-[28rem] w-[28rem] rounded-full bg-[#00ff88]/20 blur-3xl" />
        <div className="absolute -right-32 top-0 h-[26rem] w-[26rem] rounded-full bg-[#2ecc71]/15 blur-3xl" />
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
              className="self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300 transition hover:border-[#00ff88]/50 hover:text-[#00ff88]"
            >
              Go to Home
            </Link>
            <button
              onClick={logout}
              className="self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300 transition hover:border-[#00ff88]/50 hover:text-[#00ff88]"
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
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-br from-[#00ff88]/25 via-[#2ecc71]/20 to-[#27ae60]/15 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-[#00ff88]">
                    Mentor Profile
                  </span>
                  <span className="rounded-full border border-[#00ff88]/40 bg-[#00ff88]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00ff88]">
                    Live
                  </span>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="rounded-full border border-[#00ff88]/40 bg-[#00ff88]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#00ff88] transition hover:border-[#00ff88]/60 hover:bg-[#00ff88]/20"
                  >
                    <i className="fas fa-edit mr-2"></i>Edit Profile
                  </button>
                )}
              </div>
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Name</label>
                    <input
                      type="text"
                      value={mentorName}
                      onChange={(e) => setMentorName(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</label>
                    <input
                      type="email"
                      value={mentorEmail}
                      onChange={(e) => setMentorEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Roll Number</label>
                    <input
                      type="text"
                      value={mentorRollNo}
                      onChange={(e) => setMentorRollNo(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Domain</label>
                    <input
                      type="text"
                      value={mentorDomain}
                      onChange={(e) => setMentorDomain(e.target.value)}
                      placeholder="Web Development, Machine Learning, etc."
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={saveMentorProfile}
                      className="flex-1 rounded-2xl border border-[#00ff88]/40 bg-[#00ff88]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#00ff88] transition hover:border-[#00ff88]/60 hover:bg-[#00ff88]/20"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        loadMentorProfile();
                      }}
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-white/20 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200/90">
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Name</div>
                    <div className="mt-2 text-lg font-semibold text-white">{mentorName || user?.displayName || "Mentor"}</div>
                    {mentorRollNo && (
                      <div className="mt-2 text-xs text-slate-400">Roll No: {mentorRollNo}</div>
                    )}
                    <p className="mt-2 text-xs text-slate-400/90">
                      Encourage contributors, curate tasks, and unlock new iterations together.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200/90">
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Contact</div>
                    <div className="mt-2 text-lg font-semibold text-white">{mentorEmail || user?.email}</div>
                    {mentorDomain && (
                      <div className="mt-2 text-xs text-slate-400">Domain: <span className="text-[#00ff88]">{mentorDomain}</span></div>
                    )}
                    <div className="mt-3 text-xs text-slate-400">
                      Mentor ID: <span className="text-[#00ff88]">{user?.uid?.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#070b18]/95 p-8 shadow-2xl backdrop-blur"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/15 via-[#2ecc71]/10 to-[#27ae60]/15 opacity-60" />
            <div className="relative z-10">
              <h2 className="text-xl font-semibold text-white">Create Mentor Task</h2>
              <p className="mt-2 text-xs text-slate-400">
                Create tasks for students to complete. Set deadline and submission form link.
              </p>
              <form onSubmit={addTask} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Task Title <span className="text-red-400">*</span></label>
                  <input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Ship UI polish for landing hero"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Domain <span className="text-red-400">*</span></label>
                  <input
                    value={taskDomain}
                    onChange={(e) => setTaskDomain(e.target.value)}
                    placeholder="Web Development, Machine Learning, DevOps, etc."
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Deadline <span className="text-red-400">*</span></label>
                  <input
                    type="datetime-local"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Forms Link for Submission <span className="text-red-400">*</span></label>
                  <input
                    type="url"
                    value={taskFormsLink}
                    onChange={(e) => setTaskFormsLink(e.target.value)}
                    placeholder="https://forms.google.com/..."
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                    required
                  />
                </div>
                <button
                  className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#00ff88] via-[#2ecc71] to-[#27ae60] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#1a1a2e] shadow-lg shadow-[#00ff88]/25 transition hover:shadow-[#00ff88]/40 font-bold"
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
              <h3 className="text-xl font-semibold text-white">All Tasks Log</h3>
              <p className="text-xs text-slate-400">All tasks posted by mentors across all domains.</p>
            </div>
            {loading ? <span className="text-xs uppercase tracking-[0.35em] text-emerald-200/90">Refreshing…</span> : null}
          </div>
          <div className="mt-6 space-y-4">
            {allTasks.length === 0 && !loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-slate-300">
                No tasks created yet. Share your first mission with the team!
              </div>
            ) : null}
            {allTasks.map((task) => {
              const deadlineDate = task.deadline ? new Date(task.deadline) : null;
              const deadlineFormatted = deadlineDate ? deadlineDate.toLocaleString(undefined, { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : "Not set";
              
              return (
                <div
                  key={task.id}
                  className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 transition hover:border-[#00ff88]/40 hover:bg-white/10"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        {task.domain && (
                          <span className="rounded-full border border-[#00ff88]/40 bg-[#00ff88]/10 px-3 py-1 text-xs font-semibold text-[#00ff88]">
                            {task.domain}
                          </span>
                        )}
                        <span className="text-lg font-medium text-white">- {task.title}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <div>
                          <span className="text-slate-500">Deadline: </span>
                          <span className="text-white">{deadlineFormatted}</span>
                        </div>
                        {task.formsLink && (
                          <a
                            href={task.formsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-[#00ff88]/40 bg-[#00ff88]/10 px-3 py-1 text-[#00ff88] transition hover:border-[#00ff88]/60 hover:bg-[#00ff88]/20"
                          >
                            <i className="fas fa-external-link-alt mr-1"></i>View Response
                          </a>
                        )}
                        {task.createdByName && (
                          <span>
                            Created by: <span className="text-[#2ecc71]">{task.createdByName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.3em] text-slate-400">
                        {task.id.slice(0, 6)}
                      </span>
                      {task.isEnded ? (
                        <span className="rounded-full border border-gray-400/40 bg-gray-500/10 px-3 py-1 text-gray-200/80">
                          Ended
                        </span>
                      ) : (
                        <span className="rounded-full border border-[#00ff88]/40 bg-[#00ff88]/10 px-3 py-1 text-[#00ff88]">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}



import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { addDoc, collection, doc, getDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const DEPARTMENTS = ["CSE", "AIE", "CYS", "CCE", "ECE", "MECH", "ARE", "RAI", "AIDS"];

export default function EventRegistration() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const regsRef = useMemo(() => collection(db, "event_registrations"), []);
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "events", id));
        if (snap.exists()) {
          const eventData = { id: snap.id, ...snap.data() };
          
          // Get participant count
          const regsQuery = query(regsRef, where("eventId", "==", id));
          const regsSnap = await getDocs(regsQuery);
          const count = regsSnap.size;
          const full = eventData.participantLimit && count >= eventData.participantLimit;
          
          setEvent(eventData);
          setParticipantCount(count);
          setIsFull(full);
        } else {
          setEvent(null);
        }
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id, regsRef]);

  const submit = async (e) => {
    e.preventDefault();
    
    // Check if event is full
    if (isFull) {
      alert("This event is full. Registration is closed.");
      return;
    }
    
    setSubmitting(true);
    try {
      // Double-check participant count before registering
      const regsQuery = query(regsRef, where("eventId", "==", id));
      const regsSnap = await getDocs(regsQuery);
      const currentCount = regsSnap.size;
      
      if (event.participantLimit && currentCount >= event.participantLimit) {
        alert("This event is now full. Registration is closed.");
        setIsFull(true);
        setParticipantCount(currentCount);
        setSubmitting(false);
        return;
      }
      
      await addDoc(regsRef, {
        eventId: id,
        name,
        rollNo,
        email,
        department,
        year,
        phone,
        createdAt: serverTimestamp(),
      });
      
      // Update participant count
      const newCount = currentCount + 1;
      setParticipantCount(newCount);
      if (event.participantLimit && newCount >= event.participantLimit) {
        setIsFull(true);
      }
      
      setSaved(true);
      setName("");
      setRollNo("");
      setEmail("");
      setDepartment("");
      setYear("");
      setPhone("");
      setTimeout(() => setSaved(false), 5000);
    } catch (error) {
      console.error("Registration failed", error);
      alert("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02050c] text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(16,185,129,0.2),transparent_55%)]" />
        <div className="absolute -left-24 top-16 h-[26rem] w-[26rem] rounded-full bg-brand-500/25 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-[28rem] w-[28rem] rounded-full bg-emerald-500/25 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-16">
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 text-center text-sm text-slate-300 backdrop-blur">
            Loading event details…
          </div>
        ) : null}

        {event ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-indigo-200/80">
                    Registration
                  </span>
                  <h1 className="mt-4 text-3xl font-semibold text-white">{event.title}</h1>
                  <div className="mt-2 text-xs uppercase tracking-[0.35em] text-emerald-200/90">
                    {event.date ? new Date(event.date).toLocaleDateString(undefined, { dateStyle: "full" }) : "Date TBA"}
                  </div>
                  {event.participantLimit && (
                    <div className="mt-2 text-xs text-slate-300">
                      {participantCount}/{event.participantLimit} spots
                      {isFull && (
                        <span className="ml-2 font-semibold text-red-400">(Full)</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-300">
                  {event.description || "Join us for an immersive AMC FOSS experience crafted by our office bearers."}
                </div>
              </div>
            </motion.div>

            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#070b17]/95 p-8 shadow-2xl backdrop-blur"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-brand-500/10 to-emerald-500/15 opacity-70" />
              <div className="relative z-10 space-y-6">
                {isFull ? (
                  <div className="rounded-2xl border border-red-400/40 bg-red-500/20 px-4 py-3 text-sm font-medium text-red-200">
                    This event is full. Registration is closed.
                  </div>
                ) : saved ? (
                  <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-sm font-medium text-emerald-200">
                    You're booked! We'll email you the playbook and schedule shortly.
                  </div>
                ) : null}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Full Name</label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:bg-white/15 focus:ring-2 focus:ring-emerald-400/40"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Roll Number</label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:bg-white/15 focus:ring-2 focus:ring-emerald-400/40"
                      placeholder="CH.SC.U4CSE12345"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:bg-white/15 focus:ring-2 focus:ring-emerald-400/40"
                      placeholder="you@ch.students.amrita.edu"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Phone Number</label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:bg-white/15 focus:ring-2 focus:ring-emerald-400/40"
                      placeholder="+91 9876543210"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Department</label>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:bg-white/15 focus:ring-2 focus:ring-emerald-400/40"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept} className="bg-slate-900">
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Year</label>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:bg-white/15 focus:ring-2 focus:ring-emerald-400/40"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="I" className="bg-slate-900">I</option>
                      <option value="II" className="bg-slate-900">II</option>
                      <option value="III" className="bg-slate-900">III</option>
                      <option value="IV" className="bg-slate-900">IV</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting || saved || isFull}
                  className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-brand-500 to-indigo-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 translate-y-full bg-white/20 transition duration-300 group-hover:translate-y-0" />
                  <span className="relative">
                    {isFull ? "Event Full" : submitting ? "Registering..." : saved ? "Registered!" : "Confirm Seat"}
                  </span>
                </button>
              </div>
            </motion.form>
          </>
        ) : (
          !loading && (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-sm text-slate-300 backdrop-blur">
              This event could not be found. Check with office bearers for the correct registration link.
            </div>
          )
        )}
      </div>
    </div>
  );
}



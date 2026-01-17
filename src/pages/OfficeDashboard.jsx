import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import emailjs from "@emailjs/browser";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";

const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
console.log(
  "EmailJS config",
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY
);
const buildCalendarLink = (event) => {
  if (!event?.date) return "https://calendar.google.com/";
  const startDate = event.date.replace(/-/g, "");
  const startTime = event.time ? event.time.replace(/:/g, "") + "00" : "000000";
  const endTime = event.time ? event.time.replace(/:/g, "") + "00" : "235959";
  const dates = `${startDate}T${startTime}/${startDate}T${endTime}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title || "AMC FOSS Event",
    details: event.description || "AMC FOSS community event",
    location: event.eventLink || "AMC FOSS",
    dates,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const sendEmailsForEvent = async (event, participants) => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    throw new Error("Email service is not configured. Please set EmailJS environment variables.");
  }

  const calendarLink = buildCalendarLink(event);

  const tasks = participants
    .filter((participant) => participant?.email)
    .map((participant, idx) => {
      const templateParams = {
        name: participant.name || "Participant",
        email: participant.email,
        event_title: event.title || "AMC FOSS Event",
        event_date: event.date || "Date TBA",
        event_time: event.time || "Time TBA",
        reg_id: participant.registrationId || `${event.id}-${idx + 1}`,
        google_calendar_link: calendarLink,
      };
      return emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
    });

  if (!tasks.length) {
    throw new Error("No participants with email addresses found.");
  }

  await Promise.all(tasks);
};

export default function OfficeDashboard() {
  const { logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [desc, setDesc] = useState("");
  const [participantLimit, setParticipantLimit] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editParticipantLimit, setEditParticipantLimit] = useState("");
  const [editEventLink, setEditEventLink] = useState("");
  const [emailSendingId, setEmailSendingId] = useState(null);

  const eventsRef = useMemo(() => collection(db, "events"), []);
  const tasksRef = useMemo(() => collection(db, "tasks"), []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(eventsRef);
      const eventsList = snap.docs.map((docSnap) => {
        const eventData = { id: docSnap.id, ...docSnap.data() };
        const registrations = Array.isArray(eventData.registrations) ? eventData.registrations : [];
        const participantCount = registrations.length;
        const isFull = eventData.participantLimit && participantCount >= eventData.participantLimit;
        
        // Check if event has ended - use end time if available, otherwise use date
        const now = new Date().getTime();
        let eventEndTime = null;
        if (eventData.date) {
          if (eventData.time) {
            // Combine date and time
            const dateTimeStr = `${eventData.date}T${eventData.time}`;
            eventEndTime = new Date(dateTimeStr).getTime();
          } else {
            // Use date only (end of day)
            const dateOnly = new Date(eventData.date);
            dateOnly.setHours(23, 59, 59, 999);
            eventEndTime = dateOnly.getTime();
          }
        }
        const isEnded = eventEndTime ? now > eventEndTime : false;
        const isActive = !isEnded;

        return {
          ...eventData,
          registrations,
          participantCount,
          isFull,
          isEnded,
          isActive,
        };
      });

      // Sort events: active first, then date-wise
      const sortedEvents = eventsList.sort((a, b) => {
        // Active events first
        if (a.isActive !== b.isActive) {
          return a.isActive ? -1 : 1;
        }
        // Then sort by date (ascending for active, descending for ended)
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return a.isActive ? dateA - dateB : dateB - dateA;
      });
      
      setEvents(sortedEvents);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    setLoadingTasks(true);
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
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createEvent = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    await addDoc(eventsRef, {
      title,
      date: date, 
      time: time || null,
      description: desc || "",
      participantLimit: participantLimit ? parseInt(participantLimit) : null,
      eventLink: eventLink.trim() || null,
      registrations: [],
      createdAt: serverTimestamp(),
    });
    setTitle("");
    setDate("");
    setTime("");
    setDesc("");
    setParticipantLimit("");
    setEventLink("");
    await loadEvents();
  };

  const loadParticipants = (event) => {
    setSelectedEvent(event);
    setParticipants(Array.isArray(event.registrations) ? event.registrations : []);
    setShowParticipants(true);
  };

  const updateEvent = async (id, payload) => {
    const ref = doc(db, "events", id);
    await updateDoc(ref, payload);
    await loadEvents();
  };

  const deleteEvent = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteDoc(doc(db, "events", id));
      await loadEvents();
    }
  };

  const handleNotifyParticipants = async (event) => {
    const registrations = Array.isArray(event.registrations) ? event.registrations : [];
    if (!registrations.length) {
      alert("No participants to notify for this event.");
      return;
    }
    try {
      setEmailSendingId(event.id);
      await sendEmailsForEvent(event, registrations);
      alert(`Emails sent to ${registrations.length} participant${registrations.length > 1 ? "s" : ""}.`);
    } catch (err) {
      console.error("Failed to send emails:", err);
      alert(err.message || "Failed to send emails. Check console for details.");
    } finally {
      setEmailSendingId(null);
    }
  };

  const startEditing = (event) => {
    setEditingEvent(event);
    setEditTitle(event.title || "");
    setEditDate(event.date || "");
    setEditTime(event.time || "");
    setEditDesc(event.description || "");
    setEditParticipantLimit(event.participantLimit ? event.participantLimit.toString() : "");
    setEditEventLink(event.eventLink || "");
  };

  const cancelEditing = () => {
    setEditingEvent(null);
    setEditTitle("");
    setEditDate("");
    setEditTime("");
    setEditDesc("");
    setEditParticipantLimit("");
    setEditEventLink("");
  };

  const saveEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    await updateEvent(editingEvent.id, {
      title: editTitle,
      date: editDate,
      time: editTime || null,
      description: editDesc,
      participantLimit: editParticipantLimit ? parseInt(editParticipantLimit) : null,
      eventLink: editEventLink.trim() || null,
    });
    
    cancelEditing();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03060d] text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,136,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(46,204,113,0.12),transparent_55%)]" />
        <div className="absolute -left-24 top-16 h-[30rem] w-[30rem] rounded-full bg-[#00ff88]/15 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-[26rem] w-[26rem] rounded-full bg-[#2ecc71]/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-16 lg:px-12">
        <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-white">Office Bearer Studio</h1>
            <p className="mt-2 text-sm text-slate-300">
              Curate AMC FOSS experiences, launch events, and keep the community pulse alive.
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
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-br from-[#00ff88]/20 via-[#2ecc71]/15 to-[#27ae60]/10 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[#00ff88]">
                Event Ledger
              </div>
              <div className="event-ledger-scroll flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-2">
                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                    Fetching latest events…
                  </div>
                ) : null}
                {events.length === 0 && !loading ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-300">
                    No events scheduled yet. Start by creating your first community experience!
                  </div>
                ) : null}
                {events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-6 transition hover:border-[#00ff88]/40 hover:bg-white/10 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="text-lg font-semibold text-white">{event.title}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.25em] text-[#00ff88]">{event.date}</div>
                      {event.description ? (
                        <p className="mt-3 max-w-xl text-sm text-slate-300/90">{event.description}</p>
                      ) : null}
                      {event.participantLimit && (
                        <div className="mt-2 text-xs text-slate-400">
                          {event.participantCount || 0}/{event.participantLimit} spots
                          {event.isFull && (
                            <span className="ml-2 text-red-400">(Full)</span>
                          )}
                        </div>
                      )}
                      <div className="mt-2">
                        {event.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#00ff88]/40 bg-[#00ff88]/10 px-3 py-1 text-xs font-semibold text-[#00ff88]">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-gray-400/40 bg-gray-500/10 px-3 py-1 text-xs font-semibold text-gray-300">
                            Ended
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => loadParticipants(event)}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-[#00ff88]/60 hover:text-[#00ff88]"
                      >
                        View Participants
                      </button>
                      <button
                        onClick={() => handleNotifyParticipants(event)}
                        disabled={emailSendingId === event.id}
                        className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {emailSendingId === event.id ? "Sending..." : "Notify Participants"}
                      </button>
                      {event.isActive && (
                        <button
                          onClick={() => startEditing(event)}
                          className="rounded-full border border-blue-400/40 bg-blue-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-200 transition hover:border-blue-400 hover:bg-blue-500/30"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="rounded-full border border-red-400/40 bg-red-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-200 transition hover:border-red-400 hover:bg-red-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
         
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#070b18]/95 p-8 shadow-2xl backdrop-blur"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/20 via-[#2ecc71]/15 to-[#27ae60]/20 opacity-70" />
            <div className="relative z-10">
              <h2 className="text-xl font-semibold text-white">Launch New Event</h2>
              <p className="mt-2 text-xs text-slate-400">
                Craft the next open source happening—share the story, date, and vision.
              </p>
              <form onSubmit={createEvent} className="mt-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Event Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Zero to Production Workshop"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Event Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Event Time (Optional)</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Event Link (Optional)</label>
                  <input
                    type="url"
                    value={eventLink}
                    onChange={(e) => setEventLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Event Narrative</label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Describe the experience, speaker lineup, or expected outcomes."
                    className="h-32 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/70 focus:bg-white/15 focus:ring-2 focus:ring-indigo-400/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Participant Limit (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={participantLimit}
                    onChange={(e) => setParticipantLimit(e.target.value)}
                    placeholder="Leave empty for unlimited"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                  />
                </div>
                <button
                  className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#00ff88] via-[#2ecc71] to-[#27ae60] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#1a1a2e] shadow-lg shadow-[#00ff88]/30 transition hover:shadow-[#00ff88]/45 font-bold"
                >
                  <span className="absolute inset-0 translate-y-full bg-white/20 transition duration-300 group-hover:translate-y-0" />
                  <span className="relative">Publish Event</span>
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Mentor Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">All Mentor Tasks</h3>
              <p className="text-xs text-slate-400">Track all tasks created by mentors across all domains.</p>
            </div>
            {loadingTasks ? <span className="text-xs uppercase tracking-[0.35em] text-[#00ff88]">Refreshing…</span> : null}
          </div>
          <div className="mt-6 space-y-4">
            {allTasks.length === 0 && !loadingTasks ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-slate-300">
                No tasks created yet by mentors.
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

        {/* Participants Modal */}
        {showParticipants && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#03060d] p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Participants List</h2>
                  {selectedEvent ? (
                    <p className="text-xs uppercase tracking-[0.3em] text-[#00ff88] mt-1">
                      {selectedEvent.title}
                    </p>
                  ) : null}
                </div>
                <button
                  onClick={() => {
                    setShowParticipants(false);
                    setParticipants([]);
                    setSelectedEvent(null);
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-red-400/50 hover:text-red-200"
                >
                  Close
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {participants.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-300">No participants yet</div>
                ) : (
                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <div
                        key={participant.email + participant.rollNo}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{participant.name}</div>
                            <div className="mt-1 text-xs text-slate-400">{participant.email}</div>
                            <div className="mt-1 text-xs text-slate-400">
                              {participant.rollNo} • {participant.department} • Year {participant.year}
                            </div>
                            {participant.phone && (
                              <div className="mt-1 text-xs text-slate-400">Phone: {participant.phone}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Event Modal */}
        {editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#03060d] p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Edit Event</h2>
                <button
                  onClick={cancelEditing}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-red-400/50 hover:text-red-200"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={saveEvent} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Event Title</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Zero to Production Workshop"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Event Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Event Time (Optional)</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Event Link (Optional)</label>
                  <input
                    type="url"
                    value={editEventLink}
                    onChange={(e) => setEditEventLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Event Narrative</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Describe the experience, speaker lineup, or expected outcomes."
                    className="h-32 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/70 focus:bg-white/15 focus:ring-2 focus:ring-indigo-400/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Participant Limit (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    value={editParticipantLimit}
                    onChange={(e) => setEditParticipantLimit(e.target.value)}
                    placeholder="Leave empty for unlimited"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-[#00ff88]/70 focus:bg-white/15 focus:ring-2 focus:ring-[#00ff88]/40"
                  />
                </div>
                <button
                  type="submit"
                  className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#00ff88] via-[#2ecc71] to-[#27ae60] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#1a1a2e] shadow-lg shadow-[#00ff88]/30 transition hover:shadow-[#00ff88]/45 font-bold"
                >
                  <span className="absolute inset-0 translate-y-full bg-white/20 transition duration-300 group-hover:translate-y-0" />
                  <span className="relative">Save Changes</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}



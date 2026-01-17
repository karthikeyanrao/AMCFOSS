import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../Foss2.css";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const eventsRef = useMemo(() => collection(db, "events"), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(eventsRef);
        const eventsList = snap.docs.map((docSnap) => {
          const eventData = { id: docSnap.id, ...docSnap.data() };
          const registrations = Array.isArray(eventData.registrations) ? eventData.registrations : [];

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
          const participantCount = registrations.length;
          const isFull = eventData.participantLimit && participantCount >= eventData.participantLimit;

          return {
            ...eventData,
            registrations,
            participantCount,
            isFull,
            isEnded,
          };
        });

        // Sort events: upcoming first (by date ascending), then ended (by date descending)
        const sortedEvents = eventsList.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          const now = new Date().getTime();
          const aEnded = a.isEnded || (dateA && now > dateA);
          const bEnded = b.isEnded || (dateB && now > dateB);

          // If both ended or both upcoming, sort by date
          if (aEnded === bEnded) {
            // Ended events: most recent first (descending)
            // Upcoming events: soonest first (ascending)
            return aEnded ? dateB - dateA : dateA - dateB;
          }
          // Upcoming events come before ended events
          return aEnded ? 1 : -1;
        });

        setEvents(sortedEvents);
        console.log("Events loaded:", sortedEvents.length, "events");
      } catch (err) {
        console.error("Failed to load events:", err);
        console.error("Error details:", {
          code: err.code,
          message: err.message,
          stack: err.stack
        });

        let errorMessage = "Failed to load events. Please try again later.";

        if (err.code === 'permission-denied') {
          errorMessage = "Unable to load events. Please check Firebase security rules allow public read access to 'events' collection.";
        } else if (err.code === 'unavailable') {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (err.message) {
          errorMessage = `Error: ${err.message}`;
        }

        setError(errorMessage);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventsRef]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02050c] text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(34,197,94,0.18),transparent_50%)]" />
        <div className="absolute -left-24 top-12 h-[26rem] w-[26rem] rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -right-24 bottom-8 h-[28rem] w-[28rem] rounded-full bg-emerald-500/25 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 flex flex-col gap-4 text-center lg:mb-16"
        >
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-indigo-200/80">
            Calendar
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Upcoming AMC FOSS Lineup</h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-300">
            Dive into next-gen hackathons, community jams, and lightning talks. Register to reserve your seat and
            receive mission briefs right in your inbox.
          </p>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 text-center text-sm text-slate-300 backdrop-blur"
          >
            Fetching events from the community desk…
          </motion.div>
        ) : null}

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-3xl border border-red-500/40 bg-red-500/10 px-6 py-8 text-center backdrop-blur"
          >
            <div className="mb-2 text-lg font-semibold text-red-300">⚠️ Error Loading Events</div>
            <p className="text-sm text-red-200/90">{error}</p>
            <p className="mt-4 text-xs text-slate-400">
              If you're the administrator, please update Firebase Firestore security rules to allow public read access.
            </p>
          </motion.div>
        ) : null}

        <div className="mt-8 sm:mt-12 events-grid-modern w-full">
          {events.map((event, idx) => {
            const eventDate = event.date ? new Date(event.date) : null;
            const day = eventDate ? eventDate.getDate() : "TBA";
            const month = eventDate ? eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase() : "TBA";

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="event-card-modern"
              >
                <div className="event-date-modern">
                  <span className="day-modern">{day}</span>
                  <span className="month-modern">{month}</span>
                </div>
                <div className="event-details-modern">
                  <div className="event-header-modern">
                    <h2 className="event-title-modern">{event.title}</h2>
                    {event.isEnded ? (
                      <span className="event-badge-modern event-ended-badge-modern">Ended</span>
                    ) : (
                      <span className="event-badge-modern">On Campus</span>
                    )}
                  </div>
                  {event.description ? (
                    <p className="event-description-modern">{event.description}</p>
                  ) : (
                    <p className="event-description-modern">
                      Event details coming soon. Stay tuned for the full agenda drop.
                    </p>
                  )}
                  <div className="event-footer-modern">
                    {event.participantLimit && (
                      <div className="participant-info-modern">
                        <div className="participant-badge-modern">
                          <i className="fas fa-users"></i>
                          <span>{event.participantCount || 0}/{event.participantLimit}</span>
                        </div>
                        {event.isFull && !event.isEnded && (
                          <div className="event-full-modern">Full</div>
                        )}
                        {event.isEnded && (
                          <div className="event-ended-badge-modern-inline">Ended</div>
                        )}
                      </div>
                    )}
                    {event.isEnded ? (
                      <button className="register-btn-modern disabled event-ended-btn-modern" disabled>
                        <i className="fas fa-calendar-times"></i>
                        Event Ended
                      </button>
                    ) : event.isFull ? (
                      <button className="register-btn-modern disabled" disabled>
                        Event Full
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/events/${event.id}`}
                            className="register-btn-modern"
                          >
                            Register
                            <i className="fas fa-arrow-right"></i>
                          </Link>
                          {event.eventLink && (
                            <a
                              href={event.eventLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="register-btn-modern join-now-btn"
                            >
                              Join Now
                              <i className="fas fa-external-link-alt"></i>
                            </a>
                          )}
                        </div>
                        {event.hasPrelims && (() => {
                          const now = new Date().getTime();
                          const prelimsDeadline = event.prelimsDeadline ? new Date(event.prelimsDeadline).getTime() : null;
                          const prelimsExpired = prelimsDeadline && now > prelimsDeadline;

                          return (
                            <div className="flex flex-col gap-2 mt-2">
                              {prelimsDeadline && (
                                <div className="text-xs text-slate-400">
                                  <i className="fas fa-clock mr-1"></i>
                                  Prelims Deadline: {new Date(event.prelimsDeadline).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              )}
                              {prelimsExpired ? (
                                <button className="register-btn-modern disabled" disabled>
                                  <i className="fas fa-hourglass-end"></i>
                                  Prelims Closed
                                </button>
                              ) : (
                                <Link
                                  to="/exam"
                                  className="register-btn-modern prelims-btn"
                                  style={{
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    borderColor: '#f59e0b'
                                  }}
                                >
                                  <i className="fas fa-pen-fancy"></i>
                                  Start Prelims
                                </Link>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {events.length === 0 && !loading ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-sm text-slate-300 backdrop-blur">
            No events published yet. Check back soon or reach out to office bearers to seed the next gathering!
          </div>
        ) : null}
      </div>
    </div>
  );
}



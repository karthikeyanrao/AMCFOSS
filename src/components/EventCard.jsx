// Event Card Component for AMC FOSS Club
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faMapMarkerAlt,
  faUsers,
  faClock,
  faExternalLinkAlt,
  faUserPlus,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import {
  getUpcomingEvents,
  isUserRegisteredForEvent,
  registerForEvent,
  unregisterFromEvent
} from '../services/eventService';

const EventCard = ({ eventId, event, onRegisterClick }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [countdown, setCountdown] = useState('');
  const { user, userProfile } = useAuth();

  // Calculate countdown timer
  useEffect(() => {
    if (!event?.date) return;

    const calculateCountdown = () => {
      const now = new Date().getTime();
      const eventDate = event.date.toDate ? event.date.toDate().getTime() : new Date(event.date).getTime();
      const distance = eventDate - now;

      if (distance <= 0) {
        setCountdown('Event Started');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);

    return () => clearInterval(timer);
  }, [event?.date]);

  // Check if user is registered for this event
  useEffect(() => {
    if (user && eventId) {
      checkRegistrationStatus();
    }
  }, [user, eventId]);

  const checkRegistrationStatus = async () => {
    try {
      const result = await isUserRegisteredForEvent(eventId, user.uid);
      setIsRegistered(result.isRegistered);
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  // Handle registration
  const handleRegistration = async (e) => {
    e.stopPropagation();

    if (!user) {
      // Redirect to login
      onRegisterClick(event);
      return;
    }

    setRegistrationLoading(true);

    try {
      if (isRegistered) {
        // Unregister
        await unregisterFromEvent(eventId, user.uid);
        setIsRegistered(false);
      } else {
        // Register - open registration modal
        onRegisterClick(event);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message || 'Failed to update registration');
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Format event date
  const formatDate = (date) => {
    const eventDate = date.toDate ? date.toDate() : new Date(date);
    return {
      day: eventDate.getDate(),
      month: eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      year: eventDate.getFullYear(),
      time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Check if registration is open
  const isRegistrationOpen = () => {
    if (!event?.registrationDeadline) return true;
    const deadline = event.registrationDeadline.toDate ? event.registrationDeadline.toDate() : new Date(event.registrationDeadline);
    return new Date() < deadline;
  };

  // Check if event is fully booked
  const isFullyBooked = () => {
    return event?.currentRegistrations >= event?.maxParticipants;
  };

  if (!event) {
    return (
      <div className="event-card" data-aos="fade-up">
        <div className="event-date">
          <span className="day">--</span>
          <span className="month">---</span>
        </div>
        <div className="event-details">
          <h3>Loading event...</h3>
          <p>Please wait</p>
        </div>
      </div>
    );
  }

  const eventDate = formatDate(event.date);

  return (
    <motion.div
      className="event-card"
      data-aos="fade-up"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="event-date">
        <span className="day">{eventDate.day}</span>
        <span className="month">{eventDate.month}</span>
        <span className="year">{eventDate.year}</span>
      </div>

      <div className="event-details">
        <div className="event-header">
          <h3>{event.title}</h3>
          <div className="event-badges">
            <span className={`event-type-badge ${event.eventType}`}>
              {event.eventType}
            </span>
            <span className={`event-status-badge ${event.status}`}>
              {event.status}
            </span>
          </div>
        </div>

        <p className="event-description">{event.description}</p>

        <div className="event-meta">
          <div className="meta-item">
            <FontAwesomeIcon icon={faClock} className="meta-icon" />
            <span>{eventDate.time}</span>
          </div>

          {event.location && (
            <div className="meta-item">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="meta-icon" />
              <span>{event.location}</span>
            </div>
          )}

          <div className="meta-item">
            <FontAwesomeIcon icon={faUsers} className="meta-icon" />
            <span>
              {event.currentRegistrations || 0}/{event.maxParticipants || 50} registered
            </span>
          </div>
        </div>

        {event.requirements && event.requirements.length > 0 && (
          <div className="event-requirements">
            <p className="requirements-title">Requirements:</p>
            <ul className="requirements-list">
              {event.requirements.slice(0, 3).map((req, index) => (
                <li key={index}>{req}</li>
              ))}
              {event.requirements.length > 3 && (
                <li className="more-requirements">+{event.requirements.length - 3} more</li>
              )}
            </ul>
          </div>
        )}

        {countdown && (
          <div className="event-countdown">
            <FontAwesomeIcon icon={faClock} className="countdown-icon" />
            <span>{countdown}</span>
          </div>
        )}

        <div className="event-actions">
          <button
            onClick={handleRegistration}
            disabled={registrationLoading || !isRegistrationOpen() || isFullyBooked()}
            className={`registration-btn ${
              isRegistered
                ? 'registered'
                : !isRegistrationOpen() || isFullyBooked()
                ? 'disabled'
                : 'available'
            }`}
          >
            {registrationLoading ? (
              <span className="btn-loading">
                <div className="spinner"></div>
                Processing...
              </span>
            ) : isRegistered ? (
              <>
                <FontAwesomeIcon icon={faUserCheck} className="btn-icon" />
                Registered
              </>
            ) : !isRegistrationOpen() ? (
              <>
                <FontAwesomeIcon icon={faClock} className="btn-icon" />
                Registration Closed
              </>
            ) : isFullyBooked() ? (
              <>
                <FontAwesomeIcon icon={faUsers} className="btn-icon" />
                Fully Booked
              </>
            ) : !user ? (
              <>
                <FontAwesomeIcon icon={faUserPlus} className="btn-icon" />
                Login to Register
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUserPlus} className="btn-icon" />
                Register Now
              </>
            )}
          </button>

          {event.status === 'upcoming' && (
            <button className="learn-more-btn">
              <FontAwesomeIcon icon={faExternalLinkAlt} className="btn-icon" />
              Learn More
            </button>
          )}
        </div>

        {/* Progress bar for registration */}
        {event.maxParticipants && (
          <div className="registration-progress">
            <div className="progress-label">
              <span>Registration Progress</span>
              <span>{Math.round(((event.currentRegistrations || 0) / event.maxParticipants) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(((event.currentRegistrations || 0) / event.maxParticipants) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Events Grid Component
const EventsGrid = ({ onRegisterClick }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const result = await getUpcomingEvents(10);
      setEvents(result.data);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="events-grid">
        {[1, 2].map((i) => (
          <div key={i} className="event-card skeleton">
            <div className="skeleton-date">
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
            <div className="event-details">
              <h3 className="skeleton-text long"></h3>
              <p className="skeleton-text medium"></p>
              <p className="skeleton-text short"></p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-error">
        <p>{error}</p>
        <button onClick={loadEvents} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="no-events">
        <div className="no-events-icon">
          <FontAwesomeIcon icon={faCalendarAlt} />
        </div>
        <h3>No Upcoming Events</h3>
        <p>Check back soon for new events and workshops!</p>
      </div>
    );
  }

  return (
    <div className="events-grid">
      {events.map((event) => (
        <EventCard
          key={event.id}
          eventId={event.id}
          event={event}
          onRegisterClick={onRegisterClick}
        />
      ))}
    </div>
  );
};

export default EventCard;
export { EventsGrid };
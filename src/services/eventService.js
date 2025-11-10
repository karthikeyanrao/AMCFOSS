// Event Service for AMC FOSS Club - Firestore Operations
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Create a new event
 */
export const createEvent = async (eventData) => {
  try {
    const newEvent = {
      title: eventData.title,
      description: eventData.description,
      date: eventData.date ? new Date(eventData.date) : null,
      location: eventData.location || '',
      maxParticipants: eventData.maxParticipants || 50,
      currentRegistrations: 0,
      registrationDeadline: eventData.registrationDeadline ? new Date(eventData.registrationDeadline) : null,
      eventType: eventData.eventType || 'workshop',
      createdBy: eventData.createdBy,
      status: 'upcoming',
      image: eventData.image || null,
      requirements: eventData.requirements || [],
      tags: eventData.tags || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'events'), newEvent);
    return { success: true, eventId: docRef.id };
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
};

/**
 * Get event by ID
 */
export const getEventById = async (eventId) => {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (eventDoc.exists()) {
      return { success: true, data: { id: eventDoc.id, ...eventDoc.data() } };
    } else {
      throw new Error('Event not found');
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    throw new Error('Failed to fetch event');
  }
};

/**
 * Update event
 */
export const updateEvent = async (eventId, updateData) => {
  try {
    const updateFields = {
      ...updateData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'events', eventId), updateFields);
    return { success: true };
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event');
  }
};

/**
 * Delete event
 */
export const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event');
  }
};

/**
 * Get all events (with optional status filter)
 */
export const getAllEvents = async (statusFilter = null, limitCount = 50) => {
  try {
    let eventsQuery = query(
      collection(db, 'events'),
      orderBy('date', 'asc'),
      limit(limitCount)
    );

    // Apply status filter if provided
    if (statusFilter && statusFilter !== 'all') {
      eventsQuery = query(
        collection(db, 'events'),
        where('status', '==', statusFilter),
        orderBy('date', 'asc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(eventsQuery);
    const events = [];

    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: events };
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
};

/**
 * Get upcoming events
 */
export const getUpcomingEvents = async (limitCount = 10) => {
  try {
    const now = new Date();
    const eventsQuery = query(
      collection(db, 'events'),
      where('status', '==', 'upcoming'),
      where('date', '>=', now),
      orderBy('date', 'asc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(eventsQuery);
    const events = [];

    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: events };
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw new Error('Failed to fetch upcoming events');
  }
};

/**
 * Get events created by a user
 */
export const getEventsByCreator = async (createdBy, statusFilter = null, limitCount = 50) => {
  try {
    let eventsQuery = query(
      collection(db, 'events'),
      where('createdBy', '==', createdBy),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    // Apply status filter if provided
    if (statusFilter && statusFilter !== 'all') {
      eventsQuery = query(
        collection(db, 'events'),
        where('createdBy', '==', createdBy),
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(eventsQuery);
    const events = [];

    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: events };
  } catch (error) {
    console.error('Error fetching events by creator:', error);
    throw new Error('Failed to fetch events');
  }
};

/**
 * Register user for event
 */
export const registerForEvent = async (eventId, userId, registrationData) => {
  try {
    // Check if event exists and has space
    const eventResult = await getEventById(eventId);
    const event = eventResult.data;

    if (event.status !== 'upcoming') {
      throw new Error('Event is not open for registration');
    }

    if (event.currentRegistrations >= event.maxParticipants) {
      throw new Error('Event is fully booked');
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date(event.registrationDeadline.toDate()) < new Date()) {
      throw new Error('Registration deadline has passed');
    }

    // Create registration record
    const registration = {
      eventId,
      userId,
      name: registrationData.name,
      email: registrationData.email,
      department: registrationData.department,
      year: registrationData.year,
      specialRequirements: registrationData.specialRequirements || '',
      registeredAt: serverTimestamp(),
      status: 'registered'
    };

    const registrationRef = await addDoc(collection(db, 'eventRegistrations'), registration);

    // Update event registration count
    await updateDoc(doc(db, 'events', eventId), {
      currentRegistrations: increment(1),
      updatedAt: serverTimestamp()
    });

    return { success: true, registrationId: registrationRef.id };
  } catch (error) {
    console.error('Error registering for event:', error);
    throw error;
  }
};

/**
 * Unregister user from event
 */
export const unregisterFromEvent = async (eventId, userId) => {
  try {
    // Find and delete the registration
    const registrationsQuery = query(
      collection(db, 'eventRegistrations'),
      where('eventId', '==', eventId),
      where('userId', '==', userId),
      where('status', '==', 'registered')
    );

    const querySnapshot = await getDocs(registrationsQuery);

    if (querySnapshot.empty) {
      throw new Error('Registration not found');
    }

    // Delete the registration
    await deleteDoc(doc(db, 'eventRegistrations', querySnapshot.docs[0].id));

    // Update event registration count
    await updateDoc(doc(db, 'events', eventId), {
      currentRegistrations: increment(-1),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error unregistering from event:', error);
    throw error;
  }
};

/**
 * Get user's event registrations
 */
export const getUserEventRegistrations = async (userId, statusFilter = null) => {
  try {
    let registrationsQuery = query(
      collection(db, 'eventRegistrations'),
      where('userId', '==', userId),
      orderBy('registeredAt', 'desc')
    );

    // Apply status filter if provided
    if (statusFilter && statusFilter !== 'all') {
      registrationsQuery = query(
        collection(db, 'eventRegistrations'),
        where('userId', '==', userId),
        where('status', '==', statusFilter),
        orderBy('registeredAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(registrationsQuery);
    const registrations = [];

    for (const doc of querySnapshot.docs) {
      const registration = { id: doc.id, ...doc.data() };

      // Fetch event details
      const eventResult = await getEventById(registration.eventId);
      registration.event = eventResult.data;

      registrations.push(registration);
    }

    return { success: true, data: registrations };
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    throw new Error('Failed to fetch event registrations');
  }
};

/**
 * Get event registrations (for event organizers)
 */
export const getEventRegistrations = async (eventId) => {
  try {
    const registrationsQuery = query(
      collection(db, 'eventRegistrations'),
      where('eventId', '==', eventId),
      where('status', '==', 'registered'),
      orderBy('registeredAt', 'asc')
    );

    const querySnapshot = await getDocs(registrationsQuery);
    const registrations = [];

    querySnapshot.forEach((doc) => {
      registrations.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: registrations };
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    throw new Error('Failed to fetch event registrations');
  }
};

/**
 * Check if user is registered for event
 */
export const isUserRegisteredForEvent = async (eventId, userId) => {
  try {
    const registrationsQuery = query(
      collection(db, 'eventRegistrations'),
      where('eventId', '==', eventId),
      where('userId', '==', userId),
      where('status', '==', 'registered')
    );

    const querySnapshot = await getDocs(registrationsQuery);
    return { success: true, isRegistered: !querySnapshot.empty };
  } catch (error) {
    console.error('Error checking registration status:', error);
    throw new Error('Failed to check registration status');
  }
};

/**
 * Update event status
 */
export const updateEventStatus = async (eventId, status) => {
  try {
    const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid event status');
    }

    await updateDoc(doc(db, 'events', eventId), {
      status,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating event status:', error);
    throw new Error('Failed to update event status');
  }
};

/**
 * Get event statistics
 */
export const getEventStats = async () => {
  try {
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    const events = Array.from(eventsSnapshot.docs).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const stats = {
      totalEvents: events.length,
      upcomingEvents: events.filter(event => event.status === 'upcoming').length,
      ongoingEvents: events.filter(event => event.status === 'ongoing').length,
      completedEvents: events.filter(event => event.status === 'completed').length,
      cancelledEvents: events.filter(event => event.status === 'cancelled').length,
      totalRegistrations: events.reduce((sum, event) => sum + (event.currentRegistrations || 0), 0)
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching event stats:', error);
    throw new Error('Failed to fetch event statistics');
  }
};

/**
 * Search events by title or description
 */
export const searchEvents = async (searchTerm, limitCount = 20) => {
  try {
    const eventsQuery = query(
      collection(db, 'events'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(eventsQuery);
    const events = [];

    querySnapshot.forEach((doc) => {
      const eventData = { id: doc.id, ...doc.data() };

      // Simple client-side filtering
      if (
        eventData.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eventData.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eventData.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      ) {
        events.push(eventData);
      }
    });

    return { success: true, data: events };
  } catch (error) {
    console.error('Error searching events:', error);
    throw new Error('Failed to search events');
  }
};
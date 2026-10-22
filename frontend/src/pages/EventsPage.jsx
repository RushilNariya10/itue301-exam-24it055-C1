/**
 * Task 2 & Task 4 – EventsPage
 *
 * - Fetches events from GET /api/v1/events on mount (useEffect)
 * - Maintains three states: events, loading, error
 * - Renders EventCard for each event
 * - Contains a booking form (selectedEvent, quantity) using useState
 * - Client-side search box filters events by title without new API call
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function EventsPage() {
  const { token } = useAuth();

  // Task 4: Three required states
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Task 2: Booking form state (two meaningful state values)
  const [selectedEvent, setSelectedEvent] = useState('');   // state value 1
  const [quantity, setQuantity] = useState(1);              // state value 2

  // Task 4: Search filter (derived from events, no new API call)
  const [searchQuery, setSearchQuery] = useState('');

  // Task 4: Booking feedback states
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Task 4: Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${API_BASE}/api/v1/events`);
        setEvents(res.data.events || res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load events. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Task 4: Derive filtered list with .filter() on render — no new request
  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Booking form submit handler
  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setBookingMessage('');
    setBookingError('');
    setBookingLoading(true);

    try {
      await axios.post(
        `${API_BASE}/api/v1/tickets`,
        { eventId: selectedEvent, quantity: Number(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookingMessage('🎉 Ticket booked successfully!');
      // Refresh events to update availability
      const res = await axios.get(`${API_BASE}/api/v1/events`);
      setEvents(res.data.events || res.data);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Pre-fill selectedEvent when clicking "Book Now" on an EventCard
  const handleCardBook = (event) => {
    setSelectedEvent(event._id);
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="page events-page">
      <div className="page__header">
        <h1 className="page__title">Upcoming Events</h1>
        <p className="page__subtitle">Browse and book your favourite events</p>
      </div>

      {/* Task 4: Search box – filters already-fetched events */}
      <div className="search-bar">
        <input
          id="event-search"
          type="text"
          className="form-input search-bar__input"
          placeholder="🔍 Search events by title…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Task 4: Loading indicator */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" aria-label="Loading events" />
          <p>Loading events…</p>
        </div>
      )}

      {/* Task 4: Error message */}
      {error && !loading && (
        <div className="alert alert--error">
          ⚠️ {error}
        </div>
      )}

      {/* Task 4: Render EventCards from API response */}
      {!loading && !error && (
        <>
          {filteredEvents.length === 0 ? (
            <p className="empty-state">No events match your search.</p>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((ev) => (
                <EventCard
                  key={ev._id}
                  title={ev.title}
                  category={ev.category}
                  date={ev.date}
                  venue={ev.venue}
                  ticketsAvailable={ev.ticketsAvailable}
                  onBook={() => handleCardBook(ev)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Task 2: Booking form with useState for selectedEvent and quantity */}
      <div id="booking-form" className="booking-form-section">
        <h2 className="section-title">Book a Ticket</h2>

        <form className="booking-form" onSubmit={handleBook}>
          <div className="form-group">
            <label htmlFor="select-event" className="form-label">Select Event</label>
            <select
              id="select-event"
              className="form-input"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              required
            >
              <option value="">-- Choose an event --</option>
              {events
                .filter((ev) => ev.ticketsAvailable > 0)
                .map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title} ({ev.ticketsAvailable} left)
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity" className="form-label">Quantity</label>
            <input
              id="quantity"
              type="number"
              className="form-input"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          {bookingMessage && <div className="alert alert--success">{bookingMessage}</div>}
          {bookingError && <div className="alert alert--error">{bookingError}</div>}

          <button type="submit" className="btn btn--primary" disabled={bookingLoading}>
            {bookingLoading ? 'Booking…' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EventsPage;

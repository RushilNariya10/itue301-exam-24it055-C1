/**
 * Task 2 – OrganizerPanel
 *
 * This component is lazy-loaded via React.lazy + Suspense in App.jsx.
 * Only accessible to users with role === 'organizer'.
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function OrganizerPanel() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    category: '',
    date: '',
    venue: '',
    ticketsAvailable: 100,
  });
  const [createMsg, setCreateMsg] = useState('');
  const [createErr, setCreateErr] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE}/api/v1/events`)
      .then((res) => setEvents(res.data.events || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateMsg('');
    setCreateErr('');
    try {
      const res = await axios.post(
        `${API_BASE}/api/v1/events`,
        { ...form, ticketsAvailable: Number(form.ticketsAvailable) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents((prev) => [res.data.event || res.data, ...prev]);
      setCreateMsg('✅ Event created successfully!');
      setForm({ title: '', category: '', date: '', venue: '', ticketsAvailable: 100 });
    } catch (err) {
      setCreateErr(err.response?.data?.message || 'Failed to create event.');
    }
  };

  return (
    <div className="page organizer-page">
      <div className="page__header">
        <h1 className="page__title">🎪 Organizer Panel</h1>
        <p className="page__subtitle">Manage your events</p>
      </div>

      <div className="organizer-layout">
        {/* Create Event Form */}
        <section className="organizer-form-section">
          <h2 className="section-title">Create New Event</h2>
          <form className="booking-form" onSubmit={handleCreate}>
            {[
              { id: 'title', label: 'Event Title', type: 'text', placeholder: 'e.g. Tech Summit 2026' },
              { id: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Technology' },
              { id: 'date', label: 'Event Date', type: 'date' },
              { id: 'venue', label: 'Venue', type: 'text', placeholder: 'e.g. CSPIT Auditorium' },
              { id: 'ticketsAvailable', label: 'Tickets Available', type: 'number' },
            ].map(({ id, label, type, placeholder }) => (
              <div className="form-group" key={id}>
                <label htmlFor={id} className="form-label">{label}</label>
                <input
                  id={id}
                  name={id}
                  type={type}
                  className="form-input"
                  placeholder={placeholder}
                  value={form[id]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            {createMsg && <div className="alert alert--success">{createMsg}</div>}
            {createErr && <div className="alert alert--error">{createErr}</div>}

            <button type="submit" className="btn btn--primary">Create Event</button>
          </form>
        </section>

        {/* Events list */}
        <section className="organizer-events-section">
          <h2 className="section-title">All Events ({events.length})</h2>
          {loading ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : (
            <div className="org-events-list">
              {events.map((ev) => (
                <div key={ev._id} className="org-event-row">
                  <div>
                    <strong>{ev.title}</strong>
                    <span className="event-card__category" style={{ marginLeft: '0.5rem' }}>
                      {ev.category}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(ev.date).toLocaleDateString('en-IN')} · {ev.venue}
                  </div>
                  <span className={`badge ${ev.ticketsAvailable === 0 ? 'badge--sold-out' : 'badge--booked'}`}>
                    {ev.ticketsAvailable} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default OrganizerPanel;

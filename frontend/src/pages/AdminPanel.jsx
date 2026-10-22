/**
 * AdminPanel – Accessible only to role === 'admin'
 *
 * Features:
 *  1. Stats overview (total events, users, tickets booked, cancellations)
 *  2. Full bookings table: who booked how many tickets + status
 *  3. Add Event form
 */

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div className="admin-stat-card" style={{ '--stat-color': color }}>
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-body">
        <p className="admin-stat-value">{value}</p>
        <p className="admin-stat-label">{label}</p>
      </div>
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    booked:    { cls: 'badge--booked',    label: '✅ Booked' },
    cancelled: { cls: 'badge--cancelled', label: '❌ Cancelled' },
    used:      { cls: 'badge--used',      label: '🎟 Used' },
  };
  const { cls, label } = map[status] || { cls: '', label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ── Main Component ────────────────────────────────────────────────────────────
function AdminPanel() {
  const { token } = useAuth();

  const [tickets, setTickets]     = useState([]);
  const [events, setEvents]       = useState([]);
  const [loadingT, setLoadingT]   = useState(true);
  const [loadingE, setLoadingE]   = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'events' | 'add-event'

  // Filter/search state
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');

  // Add-event form
  const [form, setForm]         = useState({ title: '', category: '', date: '', venue: '', ticketsAvailable: 100 });
  const [formMsg, setFormMsg]   = useState('');
  const [formErr, setFormErr]   = useState('');
  const [creating, setCreating] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // ── Fetch all tickets (admin) ──
  useEffect(() => {
    axios.get(`${API_BASE}/api/v1/tickets/all`, authHeaders)
      .then(res => setTickets(res.data.tickets || []))
      .catch(() => setTickets([]))
      .finally(() => setLoadingT(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch all events ──
  useEffect(() => {
    axios.get(`${API_BASE}/api/v1/events`)
      .then(res => setEvents(res.data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoadingE(false));
  }, []);

  // ── Stats ──
  const stats = useMemo(() => {
    const total      = tickets.length;
    const booked     = tickets.filter(t => t.status === 'booked').length;
    const cancelled  = tickets.filter(t => t.status === 'cancelled').length;
    const used       = tickets.filter(t => t.status === 'used').length;
    const totalQty   = tickets.reduce((s, t) => s + (t.quantity || 0), 0);
    return { total, booked, cancelled, used, totalQty, events: events.length };
  }, [tickets, events]);

  // ── Filtered ticket rows ──
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q
        || t.attendeeId?.name?.toLowerCase().includes(q)
        || t.attendeeId?.email?.toLowerCase().includes(q)
        || t.eventId?.title?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [tickets, search, statusFilter]);

  // ── Add event handler ──
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormMsg(''); setFormErr(''); setCreating(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/v1/events`,
        { ...form, ticketsAvailable: Number(form.ticketsAvailable) },
        authHeaders
      );
      const newEvent = res.data.event || res.data;
      setEvents(prev => [newEvent, ...prev]);
      setFormMsg(`✅ "${newEvent.title}" created successfully!`);
      setForm({ title: '', category: '', date: '', venue: '', ticketsAvailable: 100 });
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page admin-page">
      {/* ── Header ── */}
      <div className="page__header">
        <h1 className="page__title">🛡️ Admin Panel</h1>
        <p className="page__subtitle">Full system overview — bookings, events & management</p>
      </div>

      {/* ── Stats Row ── */}
      <div className="admin-stats-row">
        <StatCard icon="🎪" label="Total Events"     value={stats.events}    color="#6c63ff" />
        <StatCard icon="🎟️" label="Total Bookings"   value={stats.total}     color="#22c55e" />
        <StatCard icon="🪑" label="Tickets Issued"   value={stats.totalQty}  color="#3b82f6" />
        <StatCard icon="❌" label="Cancellations"    value={stats.cancelled} color="#ef4444" />
        <StatCard icon="✅" label="Active Booked"    value={stats.booked}    color="#f59e0b" />
      </div>

      {/* ── Tabs ── */}
      <div className="admin-tabs">
        {[
          { id: 'bookings',  label: '📋 All Bookings' },
          { id: 'events',    label: '🎪 Events List'  },
          { id: 'add-event', label: '➕ Add Event'    },
        ].map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TAB 1: ALL BOOKINGS TABLE
      ══════════════════════════════════════════ */}
      {activeTab === 'bookings' && (
        <div className="admin-section">
          {/* Filters */}
          <div className="admin-filters">
            <input
              className="form-input"
              placeholder="🔍 Search by user name, email or event…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, maxWidth: 360 }}
            />
            <select
              className="form-input"
              value={statusFilter}
              onChange={e => setStatus(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="all">All Statuses</option>
              <option value="booked">Booked</option>
              <option value="cancelled">Cancelled</option>
              <option value="used">Used</option>
            </select>
            <span className="admin-count-badge">{filteredTickets.length} record{filteredTickets.length !== 1 ? 's' : ''}</span>
          </div>

          {loadingT ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : filteredTickets.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: '2rem' }}>📭</p>
              <p>No bookings found matching your filters.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Attendee</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th>Booked On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t, i) => (
                    <tr key={t._id} className={t.status === 'cancelled' ? 'admin-row--cancelled' : ''}>
                      <td className="admin-cell--muted">{i + 1}</td>
                      <td className="admin-cell--name">
                        <span className="admin-avatar">
                          {(t.attendeeId?.name || '?')[0].toUpperCase()}
                        </span>
                        {t.attendeeId?.name || '—'}
                      </td>
                      <td className="admin-cell--muted">{t.attendeeId?.email || '—'}</td>
                      <td className="admin-cell--event">{t.eventId?.title || '—'}</td>
                      <td className="admin-cell--muted">
                        {t.eventId?.date
                          ? new Date(t.eventId.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="admin-cell--muted">{t.eventId?.venue || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="admin-qty-badge">{t.quantity}</span>
                      </td>
                      <td className="admin-cell--muted">
                        {new Date(t.bookingDate || t.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 2: EVENTS LIST
      ══════════════════════════════════════════ */}
      {activeTab === 'events' && (
        <div className="admin-section">
          {loadingE ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : events.length === 0 ? (
            <div className="empty-state"><p>No events found.</p></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Event Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th style={{ textAlign: 'center' }}>Tickets Left</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, i) => (
                    <tr key={ev._id}>
                      <td className="admin-cell--muted">{i + 1}</td>
                      <td className="admin-cell--event">{ev.title}</td>
                      <td>
                        <span className="event-card__category">{ev.category}</span>
                      </td>
                      <td className="admin-cell--muted">
                        {new Date(ev.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="admin-cell--muted">{ev.venue}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="admin-qty-badge">{ev.ticketsAvailable}</span>
                      </td>
                      <td>
                        <span className={`badge ${ev.ticketsAvailable === 0 ? 'badge--sold-out' : 'badge--booked'}`}>
                          {ev.ticketsAvailable === 0 ? 'Sold Out' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 3: ADD EVENT
      ══════════════════════════════════════════ */}
      {activeTab === 'add-event' && (
        <div className="admin-section">
          <div className="admin-form-card">
            <h2 className="section-title">➕ Create New Event</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Fill in the details below to publish a new event to the platform.
            </p>
            <form className="booking-form" onSubmit={handleCreate}>
              <div className="admin-form-grid">
                {[
                  { id: 'title',            label: 'Event Title',        type: 'text',   placeholder: 'e.g. Tech Summit 2026' },
                  { id: 'category',         label: 'Category',           type: 'text',   placeholder: 'e.g. Technology, Cultural…' },
                  { id: 'date',             label: 'Event Date',         type: 'date',   placeholder: '' },
                  { id: 'venue',            label: 'Venue',              type: 'text',   placeholder: 'e.g. CSPIT Auditorium' },
                  { id: 'ticketsAvailable', label: 'Tickets Available',  type: 'number', placeholder: '100' },
                ].map(({ id, label, type, placeholder }) => (
                  <div className="form-group" key={id}>
                    <label htmlFor={`admin-${id}`} className="form-label">{label}</label>
                    <input
                      id={`admin-${id}`}
                      name={id}
                      type={type}
                      className="form-input"
                      placeholder={placeholder}
                      value={form[id]}
                      min={type === 'number' ? 0 : undefined}
                      onChange={e => setForm({ ...form, [id]: e.target.value })}
                      required
                    />
                  </div>
                ))}
              </div>

              {formMsg && <div className="alert alert--success">{formMsg}</div>}
              {formErr && <div className="alert alert--error">{formErr}</div>}

              <button
                type="submit"
                className="btn btn--primary"
                disabled={creating}
                style={{ alignSelf: 'flex-start', minWidth: 160 }}
              >
                {creating ? '⏳ Creating…' : '🚀 Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;

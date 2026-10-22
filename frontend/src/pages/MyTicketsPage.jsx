import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const STATUS_LABELS = {
  booked: { label: 'Booked', cls: 'badge--booked' },
  cancelled: { label: 'Cancelled', cls: 'badge--cancelled' },
  used: { label: 'Used', cls: 'badge--used' },
};

function MyTicketsPage() {
  const { token } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      // GET /api/v1/tickets/my — uses .populate() on backend
      const res = await axios.get(`${API_BASE}/api/v1/tickets/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data.tickets || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch your tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (ticketId) => {
    setCancellingId(ticketId);
    try {
      await axios.patch(
        `${API_BASE}/api/v1/tickets/${ticketId}/status`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh list after cancel
      await fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel ticket.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="page my-tickets-page">
      <div className="page__header">
        <h1 className="page__title">My Tickets</h1>
        <p className="page__subtitle">All your booked event tickets</p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner" aria-label="Loading tickets" />
          <p>Loading your tickets…</p>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert--error">⚠️ {error}</div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="empty-state">
          <p>🎟️ You have no tickets yet. <a href="/events">Browse events</a> to book one!</p>
        </div>
      )}

      {!loading && !error && tickets.length > 0 && (
        <div className="tickets-grid">
          {tickets.map((ticket) => {
            const event = ticket.eventId;   // populated by backend
            const { label, cls } = STATUS_LABELS[ticket.status] || {};

            return (
              <div key={ticket._id} className="ticket-card">
                <div className="ticket-card__header">
                  <h3 className="ticket-card__title">{event?.title || 'Event'}</h3>
                  <span className={`badge ${cls}`}>{label}</span>
                </div>

                <div className="ticket-card__details">
                  <p>📅 {event?.date ? new Date(event.date).toLocaleDateString('en-IN') : '—'}</p>
                  <p>📍 {event?.venue || '—'}</p>
                  <p>🎟️ Qty: <strong>{ticket.quantity}</strong></p>
                  <p>🗓️ Booked: {new Date(ticket.bookingDate).toLocaleDateString('en-IN')}</p>
                </div>

                {ticket.status === 'booked' && (
                  <button
                    className="btn btn--danger btn--sm"
                    onClick={() => handleCancel(ticket._id)}
                    disabled={cancellingId === ticket._id}
                  >
                    {cancellingId === ticket._id ? 'Cancelling…' : 'Cancel Ticket'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyTicketsPage;

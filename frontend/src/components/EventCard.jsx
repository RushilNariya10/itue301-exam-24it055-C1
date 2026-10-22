/**
 * Task 1 – EventCard reusable component
 *
 * Props:
 *   title            {string}  – event name
 *   category         {string}  – e.g. "Music", "Tech"
 *   date             {string}  – ISO date string
 *   venue            {string}  – location
 *   ticketsAvailable {number}  – remaining ticket count
 *   onBook           {func}    – callback when "Book" is clicked
 */
function EventCard({ title, category, date, venue, ticketsAvailable, onBook }) {
  // Sold-out check: simple conditional at top of component (as hinted)
  const isSoldOut = ticketsAvailable === 0;

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="event-card">
      <div className="event-card__header">
        <span className="event-card__category">{category}</span>
        {isSoldOut && <span className="badge badge--sold-out">Sold Out</span>}
      </div>

      <h3 className="event-card__title">{title}</h3>

      <div className="event-card__details">
        <p className="event-card__detail">
          <span className="icon">📅</span> {formattedDate}
        </p>
        <p className="event-card__detail">
          <span className="icon">📍</span> {venue}
        </p>
        <p className="event-card__detail">
          <span className="icon">🎟️</span>{' '}
          {isSoldOut ? 'No tickets left' : `${ticketsAvailable} tickets available`}
        </p>
      </div>

      <div className="event-card__footer">
        {isSoldOut ? (
          <span className="badge badge--sold-out badge--large">Sold Out</span>
        ) : (
          <button
            className="btn btn--primary"
            onClick={() => onBook && onBook({ title, category, date, venue, ticketsAvailable })}
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
}

export default EventCard;

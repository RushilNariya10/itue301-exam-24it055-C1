import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { token, attendee, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <Link to={token ? '/events' : '/'} className="navbar__logo">
          🎫 EventHub
        </Link>
      </div>

      <ul className="navbar__links">
        {!token ? (
          <li>
            <Link to="/" className="navbar__link">Login</Link>
          </li>
        ) : (
          <>
            <li>
              <Link to="/events" className="navbar__link">Events</Link>
            </li>
            <li>
              <Link to="/my-tickets" className="navbar__link">My Tickets</Link>
            </li>
            {role === 'organizer' && (
              <li>
                <Link to="/organizer" className="navbar__link navbar__link--special">
                  Organizer Panel
                </Link>
              </li>
            )}
          </>
        )}
      </ul>

      {token && (
        <div className="navbar__user">
          <span className="navbar__username">👤 {attendee?.name}</span>
          <button className="btn btn--outline btn--sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

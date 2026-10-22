import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute guards a route behind authentication AND optionally a role.
 *
 * requiredRole can be a single string OR an array of strings.
 *
 * Failure cases:
 *   - No token  → redirect to /  (login page)
 *   - Wrong role → redirect to /events  (logged in but unauthorised)
 */
function ProtectedRoute({ children, requiredRole }) {
  const { token, role } = useAuth();

  // Case 1: no token at all → send to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Case 2: token exists but role doesn't match → send to events (not logout)
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(role)) {
      return <Navigate to="/events" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;

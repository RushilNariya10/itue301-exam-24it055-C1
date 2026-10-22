import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import EventsPage from './pages/EventsPage';
import MyTicketsPage from './pages/MyTicketsPage';

/**
 * Task 2 – Lazy-load OrganizerPanel using React.lazy + Suspense
 * The chunk is only downloaded when the /organizer route is accessed.
 */
const OrganizerPanel = lazy(() => import('./pages/OrganizerPanel'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public route */}
            <Route path="/" element={<LoginPage />} />

            {/* Protected – any authenticated user */}
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected – any authenticated user */}
            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute>
                  <MyTicketsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected + role-gated + lazy-loaded */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute requiredRole="organizer">
                  <Suspense
                    fallback={
                      <div className="loading-state">
                        <div className="spinner" aria-label="Loading organizer panel" />
                        <p>Loading Organizer Panel…</p>
                      </div>
                    }
                  >
                    <OrganizerPanel />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Catch-all → redirect to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

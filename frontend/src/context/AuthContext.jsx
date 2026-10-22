import { createContext, useContext, useState } from 'react';

// AuthContext holds { attendee, token, role }
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [attendee, setAttendee] = useState(
    JSON.parse(localStorage.getItem('attendee')) || null
  );
  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  );
  const [role, setRole] = useState(
    localStorage.getItem('role') || null
  );

  const login = (attendeeData, tokenData, roleData) => {
    setAttendee(attendeeData);
    setToken(tokenData);
    setRole(roleData);
    localStorage.setItem('attendee', JSON.stringify(attendeeData));
    localStorage.setItem('token', tokenData);
    localStorage.setItem('role', roleData);
  };

  const logout = () => {
    setAttendee(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('attendee');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ attendee, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming auth context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

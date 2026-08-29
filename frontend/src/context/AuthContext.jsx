import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  // 1. Lazy initialization: Read from localStorage right when the state is created.
  // This completely eliminates the need for the useEffect and prevents double-renders.
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  // Since we read synchronously from localStorage above, loading is instantly false.
  const [loading] = useState(false);

  const [lastBookingEvent, setLastBookingEvent] = useState(null);

  // Phase 18 — one shared SSE connection for the whole app, opened whenever
  // a session exists and closed on logout. EventSource can't set a custom
  // Authorization header, so the JWT travels as a query parameter instead —
  // the backend's verifyToken accepts it as a fallback for exactly this.
  useEffect(() => {
    if (!token) return undefined;

    const eventSource = new EventSource(`${API_BASE_URL}/events/stream?token=${token}`);

    eventSource.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data.type === 'BOOKING_STATUS_UPDATED') {
        setLastBookingEvent({ ...data, receivedAt: Date.now() });

        // Read fresh from localStorage rather than the closed-over `user`
        // state — this effect only re-runs when `token` changes, so a
        // stale closure would otherwise keep using whatever `user` was at
        // login time even after a profile update changed the display name.
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        const isMine = storedUser && data.userId === storedUser.id;
        const isAdmin = storedUser?.role === 'ADMIN';
        if (isMine || isAdmin) {
          toast(`Booking #${data.bookingId} is now ${data.status}`, { icon: '🔔' });
        }
      }
    };

    eventSource.onerror = () => {
      // EventSource retries automatically on transient drops — this is
      // just a debugging breadcrumb, not shown to the user.
      console.warn('SSE connection interrupted, browser will attempt to reconnect.');
    };

    return () => {
      eventSource.close();
    };
  }, [token]);

  function login(userData, authToken) {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  function updateUser(updatedUser) {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  const value = { user, token, loading, login, logout, updateUser, lastBookingEvent };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 2. This comment tells Vite's Fast Refresh linter to allow the useAuth hook to be exported here
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import RoomList from './pages/RoomList';
import RoomDetail from './pages/RoomDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ReservationDetail from './pages/ReservationDetail';
import ReservationHistory from './pages/ReservationHistory';
import AdminManageRoom from './pages/AdminManageRoom';
import AdminManageReservation from './pages/AdminManageReservation';
import API from './api';

function AppContent() {
  const { user, token, loading } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = () => {
    if (!token || (user && user.role === 'admin')) {
      setCartCount(0);
      return;
    }
    API.get('/cart')
      .then((res) => {
        const count = res.data.data?.cart_items?.reduce((acc, item) => acc + item.kuantitas, 0) || 0;
        setCartCount(count);
      })
      .catch(() => setCartCount(0));
  };

  useEffect(() => {
    fetchCartCount();
  }, [token, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const ProtectedRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin/rooms" replace />;
    return children;
  };

  const AdminRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" replace />;
    if (user?.role !== 'admin') return <Navigate to="/" replace />;
    return children;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar cartCount={cartCount} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={!token ? <Login /> : <Navigate to={user?.role === 'admin' ? '/admin/rooms' : '/'} replace />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/rooms/:id" element={<RoomDetail fetchCartCount={fetchCartCount} />} />
          
          <Route path="/cart" element={<ProtectedRoute><Cart fetchCartCount={fetchCartCount} /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout fetchCartCount={fetchCartCount} /></ProtectedRoute>} />
          <Route path="/reservations/:id" element={<ProtectedRoute><ReservationDetail /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><ReservationHistory /></ProtectedRoute>} />

          <Route path="/admin/rooms" element={<AdminRoute><AdminManageRoom /></AdminRoute>} />
          <Route path="/admin/reservations" element={<AdminRoute><AdminManageReservation /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} KosHub. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

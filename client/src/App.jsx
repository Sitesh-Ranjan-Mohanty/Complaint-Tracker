import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ComplaintSubmissionPage from './pages/ComplaintSubmissionPage';
import TrackingPage from './pages/TrackingPage';
import AgentDashboardPage from './pages/AgentDashboardPage';
import EscalationPage from './pages/EscalationPage';
import ComplaintDetailsPage from './pages/ComplaintDetailsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';

export default function App() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState(false);
  const isLoginPage = location.pathname === '/login';
  const canViewAgentTools = user && ['agent', 'admin'].includes(user.role);
  const canViewSubmit = user && ['customer', 'admin'].includes(user.role);
  const canViewAdmin = user?.role === 'admin';

  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => setPageLoading(false), 350);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return (
    <div className="app">
      {pageLoading && <div className="route-loader" />}
      {!isLoginPage && (
        <nav className="topbar">
          <h1>Complaint Tracker</h1>
          <div className="topbar-links">
            <Link to="/track">Track</Link>
            {canViewSubmit && <Link to="/submit">Submit</Link>}
            {canViewAgentTools && <Link to="/agent">Agent</Link>}
            {canViewAgentTools && <Link to="/escalations">Escalations</Link>}
            {canViewAdmin && <Link to="/admin">Admin</Link>}
            {user ? <button onClick={logout}>Logout</button> : <Link to="/login">Login</Link>}
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/track" replace />} />
        <Route path="/submit" element={<ProtectedRoute roles={['customer', 'admin']}><ComplaintSubmissionPage /></ProtectedRoute>} />
        <Route path="/track" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
        <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetailsPage /></ProtectedRoute>} />
        <Route path="/agent" element={<ProtectedRoute roles={['agent', 'admin']}><AgentDashboardPage /></ProtectedRoute>} />
        <Route path="/escalations" element={<ProtectedRoute roles={['agent', 'admin']}><EscalationPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminAnalyticsPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

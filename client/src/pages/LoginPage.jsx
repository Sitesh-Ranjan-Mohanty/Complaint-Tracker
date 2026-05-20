import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('customer@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      await login(email, password);
      navigate('/track');
    } catch {
      setError('Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card narrow login-card">
      <h2>Welcome Back</h2>
      <p className="muted">Sign in to continue managing complaints efficiently.</p>
      <p className="muted">Demo: customer@example.com / agent@example.com / admin@example.com</p>
      <form onSubmit={submit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" disabled={isSubmitting} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" disabled={isSubmitting} />
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing In...' : 'Sign In'}</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

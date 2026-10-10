import { ArrowRight, CheckSquare, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/axiosInstance.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to sign in right now.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-story">
        <Link className="brand auth-brand" to="/"><span className="brand-mark"><CheckSquare size={19} strokeWidth={2.6} /></span><span>task<span className="brand-accent">flow</span></span></Link>
        <div className="story-copy">
          <span className="eyebrow">MAKE ROOM FOR WHAT MATTERS</span>
          <h1>Good work<br />starts with a<br /><em>clear mind.</em></h1>
          <p>A calmer way to plan your day, find your focus, and make progress that feels good.</p>
        </div>
        <div className="story-footer"><span className="story-line" />A little progress is still progress.</div>
        <span className="story-decoration decoration-one" /><span className="story-decoration decoration-two" />
      </section>
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to TaskFlow</h2>
          <p className="auth-subtitle">Pick up right where you left off.</p>
          {error && <div className="inline-error" role="alert">{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            <label className="field-label" htmlFor="login-email">Email address
              <span className="input-with-icon"><Mail size={17} /><input id="login-email" type="email" autoComplete="email" required maxLength="254" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></span>
            </label>
            <label className="field-label" htmlFor="login-password">Password
              <span className="input-with-icon"><LockKeyhole size={17} /><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Your password" /><button type="button" className="password-toggle" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
            </label>
            <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Signing in…' : <>Sign in <ArrowRight size={17} /></>}</button>
          </form>
          <p className="auth-switch">New to TaskFlow? <Link to="/register">Create an account</Link></p>
          <p className="auth-security"><LockKeyhole size={13} /> Your workspace is private and secure.</p>
        </div>
      </section>
    </main>
  );
}

import { ArrowRight, CheckSquare, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/axiosInstance.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }
    if (new TextEncoder().encode(form.password).length > 72) {
      setError('Password must be no more than 72 UTF-8 bytes.');
      return;
    }
    setBusy(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to create your account right now.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-story">
        <Link className="brand auth-brand" to="/"><span className="brand-mark"><CheckSquare size={19} strokeWidth={2.6} /></span><span>task<span className="brand-accent">flow</span></span></Link>
        <div className="story-copy">
          <span className="eyebrow">YOUR DAY, WITH A LITTLE MORE EASE</span>
          <h1>Start with<br />one small<br /><em>step.</em></h1>
          <p>Make a little space for the things you want to do. The rest can follow.</p>
        </div>
        <div className="story-footer"><span className="story-line" />Build a rhythm that works for you.</div>
        <span className="story-decoration decoration-one" /><span className="story-decoration decoration-two" />
      </section>
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <span className="eyebrow">A FRESH START</span>
          <h2>Create your account</h2>
          <p className="auth-subtitle">Your own space to think, plan, and make progress.</p>
          {error && <div className="inline-error" role="alert">{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            <label className="field-label" htmlFor="register-name">Your name
              <span className="input-with-icon"><UserRound size={17} /><input id="register-name" autoComplete="name" required minLength="2" maxLength="80" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Alex Morgan" /></span>
            </label>
            <label className="field-label" htmlFor="register-email">Email address
              <span className="input-with-icon"><Mail size={17} /><input id="register-email" type="email" autoComplete="email" required maxLength="254" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></span>
            </label>
            <label className="field-label" htmlFor="register-password">Password
              <span className="input-with-icon"><LockKeyhole size={17} /><input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength="8" maxLength="128" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" /><button type="button" className="password-toggle" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
            </label>
            <label className="field-label" htmlFor="register-confirm">Confirm password
              <span className="input-with-icon"><LockKeyhole size={17} /><input id="register-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength="8" maxLength="128" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="Type it once more" /></span>
            </label>
            <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Creating account…' : <>Create account <ArrowRight size={17} /></>}</button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          <p className="auth-security"><LockKeyhole size={13} /> Your workspace is private and secure.</p>
        </div>
      </section>
    </main>
  );
}

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">404 — LOST YOUR WAY?</span>
      <h1>Let's get you back in flow.</h1>
      <p>This page isn't on your list.</p>
      <Link className="button button-primary" to="/dashboard">Back to overview</Link>
    </main>
  );
}

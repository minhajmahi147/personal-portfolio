import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function ResetPage() {
  const { user, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", code: "", password: "" });
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function sendCode() {
    setError("");
    setNote("");
    try {
      await api.sendCode(form.email, "reset");
      setNote(`Code sent to ${form.email}. Check your inbox (and spam).`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await resetPassword(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <p className="section-label">
          00 <span>Reset password</span>
        </p>
        <h1>Forgot password</h1>
        <label>
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            required
            autoComplete="email"
          />
        </label>
        <button className="theme-btn" type="button" onClick={sendCode} disabled={!form.email}>
          {note ? "Resend code" : "Send verification code"}
        </button>
        <label>
          <span>Verification code</span>
          <input
            name="code"
            value={form.code}
            onChange={update}
            required
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder="6-digit code from your email"
          />
        </label>
        <label>
          <span>New password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={update}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        {note ? <p className="form-note ok">{note}</p> : null}
        {error ? <p className="form-note bad">{error}</p> : null}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Set new password"}
        </button>
        <p className="auth-switch">
          Remembered it? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

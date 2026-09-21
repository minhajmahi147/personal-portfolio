import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    slug: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const account = await register(form);
      navigate("/dashboard");
      return account;
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
          00 <span>Register</span>
        </p>
        <h1>Create your site</h1>
        <label>
          <span>Name</span>
          <input name="name" value={form.name} onChange={update} required maxLength={80} />
        </label>
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
        <label>
          <span>Password</span>
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
        <label>
          <span>Public slug</span>
          <input
            name="slug"
            value={form.slug}
            onChange={update}
            required
            minLength={3}
            maxLength={32}
            pattern="[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?"
            placeholder="your-name"
          />
        </label>
        <p className="form-note">
          Your site will live at <code>/u/{form.slug || "your-slug"}</code>
        </p>
        {error ? <p className="form-note bad">{error}</p> : null}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </button>
        <p className="auth-switch">
          Already have one? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

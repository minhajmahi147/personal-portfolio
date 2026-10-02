import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) return;
    let cancelled = false;
    api
      .adminUsers()
      .then((data) => {
        if (cancelled) return;
        setUsers(data.users || []);
        setCount(data.count || 0);
        setReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) return <p className="page-status wrap">Checking session…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="dashboard admin-page">
      <header className="dash-bar wrap">
        <div>
          <p className="section-label" style={{ marginBottom: "0.35rem" }}>
            Admin
          </p>
          <h1>Users & sites</h1>
          <p className="dash-meta">
            {count} account{count === 1 ? "" : "s"} · signed in as {user.email}
          </p>
        </div>
        <div className="dash-actions">
          <Link className="btn ghost" to="/dashboard">
            My dashboard
          </Link>
          <button className="theme-btn" type="button" onClick={() => logout()}>
            Sign out
          </button>
        </div>
      </header>

      <div className="dash-panel wrap">
        {error ? <p className="form-note bad">{error}</p> : null}
        {!ready && !error ? <p className="form-note">Loading users…</p> : null}

        {ready ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Profile</th>
                  <th>Slug</th>
                  <th>Theme</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.email}</td>
                    <td>{row.site?.profile_name || "—"}</td>
                    <td>
                      {row.site ? (
                        <code>{row.site.slug}</code>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{row.site?.theme || "—"}</td>
                    <td>
                      {row.site ? (
                        <span className={row.site.published ? "admin-pill on" : "admin-pill"}>
                          {row.site.published ? "Published" : "Draft"}
                        </span>
                      ) : (
                        "No site"
                      )}
                    </td>
                    <td>{formatDate(row.created_at)}</td>
                    <td>
                      {row.site ? (
                        <Link to={`/u/${row.site.slug}`}>View</Link>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}

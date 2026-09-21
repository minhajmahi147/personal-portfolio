import { Link } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing">
      <header className="landing-bar wrap">
        <Link className="brand" to="/">
          <span className="mark">P</span>
          <span>
            <small>Builder</small>
            <strong>PORTFOLIO</strong>
          </span>
        </Link>
        <div className="landing-actions">
          {user ? (
            <>
              <Link className="btn ghost" to={`/u/${user.site.slug}`}>
                My site
              </Link>
              <Link className="btn" to="/dashboard">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link className="btn ghost" to="/login">
                Sign in
              </Link>
              <Link className="btn" to="/register">
                Create site
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="landing-hero wrap">
        <p className="kicker">
          <span className="pulse" aria-hidden="true" />
          Multi-tenant portfolio builder
        </p>
        <h1>
          Fill the dashboard.
          <br />
          Get <em>your</em> site.
        </h1>
        <p className="lead">
          Register, pick a public slug, enter your details, choose skills and theme,
          then publish. Visitors open <code>/u/your-slug</code>.
        </p>
        <div className="actions">
          <Link className="btn" to={user ? "/dashboard" : "/register"}>
            {user ? "Open dashboard" : "Start building"}
          </Link>
          <Link className="btn ghost" to="/u/mahi">
            See demo · /u/mahi
          </Link>
        </div>
        <ol className="landing-steps">
          <li>
            <b>1. Account</b>
            <span>Email, password, and a unique slug.</span>
          </li>
          <li>
            <b>2. Dashboard</b>
            <span>Profile, projects, path, stack, theme.</span>
          </li>
          <li>
            <b>3. Publish</b>
            <span>Flip live and share your URL.</span>
          </li>
        </ol>
        <p className="landing-demo">
          Demo login: <code>mahi@demo.local</code> / <code>mahi1234</code>
        </p>
      </main>
    </div>
  );
}

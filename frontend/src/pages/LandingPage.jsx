import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function LandingPage() {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    if (!next) {
      video.volume = 1;
      video.play().catch(() => {});
    }
    setMuted(next);
  }

  return (
    <div className="landing">
      <div className="landing-media">
        <video
          ref={videoRef}
          className="landing-video"
          src="/landing-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div className="landing-media-fade" aria-hidden="true" />
      </div>

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
          Justtttttttttttt Fill the dashboard.
          <br />
          And Get <em>your</em> portfolio ready.
        </h1>
        <div className="actions">
          <Link className="btn" to={user ? "/dashboard" : "/register"}>
            {user ? "Open dashboard" : "Start building"}
          </Link>
          <Link className="btn ghost" to="/u/mahi">
            See demo 
          </Link>
          <button
            type="button"
            className="btn ghost landing-sound"
            onClick={toggleSound}
            aria-label={muted ? "Unmute video" : "Mute video"}
            aria-pressed={!muted}
          >
            {muted ? (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M16.5 12c0-1.8-1-3.3-2.5-4v2.2l2.4 2.4c.07-.19.1-.4.1-.6zm2.5 0c0 .9-.2 1.8-.5 2.6l1.5 1.5c.7-1.2 1-2.6 1-4.1 0-4.3-3-7.9-7-8.8v2.1c2.9.9 5 3.5 5 6.7zM4.3 3 3 4.3 7.7 9H3v6h4l5 5v-6.7l4.3 4.3c-.7.5-1.4.9-2.3 1.2v2.1a9 9 0 0 0 3.7-1.8L19.7 21 21 19.7 4.3 3zM12 4 9.9 6.1 12 8.2V4z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"
                />
              </svg>
            )}
          </button>
        </div>
        <ol className="landing-steps">
          <li style={{ "--i": 0 }}>
            <span className="landing-step-num" aria-hidden="true">1</span>
            <div>
              <b>Create an account</b>
              <span>Sign up with your email and pick a site name.</span>
            </div>
          </li>
          <li style={{ "--i": 1 }}>
            <span className="landing-step-num" aria-hidden="true">2</span>
            <div>
              <b>Fill your dashboard</b>
              <span>Add your info, projects, skills, and style.</span>
            </div>
          </li>
          <li className="landing-step-boom" style={{ "--i": 2 }}>
            <span className="landing-step-num" aria-hidden="true">3</span>
            <div>
              <b>Boom — your site is ready</b>
              <span>Hit publish and share your link with anyone.</span>
            </div>
          </li>
        </ol>
        {/* <p className="landing-demo">
          Try it: <code>mahi@demo.local</code> / <code>mahi1234</code>
        </p> */}
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function Footer({ profile }) {
  const [live, setLive] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((response) => {
        if (!cancelled) setLive(response.ok ? "on" : "off");
      })
      .catch(() => {
        if (!cancelled) setLive("off");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <span>
          {profile?.name || "Portfolio"} · {new Date().getFullYear()}
        </span>
        <span className="live">
          <span className={`dot ${live === "on" ? "on" : live === "off" ? "off" : ""}`} />
          {live === "on" ? "API live" : live === "off" ? "API offline" : "Checking API"}
        </span>
      </div>
    </footer>
  );
}

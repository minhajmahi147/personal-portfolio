import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const links = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#path", label: "Path" },
  { href: "#stack", label: "Stack" },
  { href: "#contact", label: "Contact" },
];

function applyTheme(next) {
  if (next === "ice") document.documentElement.dataset.theme = "ice";
  else delete document.documentElement.dataset.theme;
}

export default function Nav({ profile, theme = "night", brandMark = "M", onThemeChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [localTheme, setLocalTheme] = useState(theme);
  const name = profile?.name || "Portfolio";
  const short = name.split(" ").pop()?.toUpperCase() || "SITE";
  const cv = profile?.links?.cv;

  useEffect(() => {
    setLocalTheme(theme);
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = links
      .map((link) => document.querySelector(link.href))
      .filter(Boolean);
    const update = () => {
      const marker = window.scrollY + 140;
      let current = "";
      sections.forEach((section) => {
        if (section.offsetTop <= marker) current = `#${section.id}`;
      });
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  function toggleTheme() {
    const next = localTheme === "ice" ? "night" : "ice";
    applyTheme(next);
    setLocalTheme(next);
    onThemeChange?.(next);
  }

  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <a className="brand" href="#top" onClick={() => setOpen(false)}>
          <span className="mark">{brandMark}</span>
          <span>
            <small>Portfolio</small>
            <strong>{short.slice(0, 12)}</strong>
          </span>
        </a>
        <div className="nav-end">
          <nav className={`nav-links ${open ? "open" : ""}`} aria-label="Primary">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={active === link.href ? "active" : ""}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {cv ? (
              <a className="nav-cv" href={cv} download onClick={() => setOpen(false)}>
                Download the CV
              </a>
            ) : null}
            <Link className="nav-links-dash" to="/dashboard" onClick={() => setOpen(false)}>
              Dashboard
            </Link>
          </nav>
          <button
            className={`theme-btn ${localTheme === "ice" ? "on" : ""}`}
            type="button"
            aria-pressed={localTheme === "ice"}
            aria-label={localTheme === "ice" ? "Switch to night theme" : "Switch to cool white theme"}
            onClick={toggleTheme}
          >
            {localTheme === "ice" ? "Night" : "White"}
          </button>
          <button
            className="menu-btn"
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}

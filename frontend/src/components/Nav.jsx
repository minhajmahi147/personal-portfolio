import { useEffect, useState } from "react";
import { profile } from "../data.js";

const links = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#path", label: "Path" },
  { href: "#stack", label: "Stack" },
  { href: "#contact", label: "Contact" },
];

function readTheme() {
  return document.documentElement.dataset.theme === "ice" ? "ice" : "night";
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [theme, setTheme] = useState(readTheme);

  function toggleTheme() {
    const next = theme === "ice" ? "night" : "ice";
    if (next === "ice") document.documentElement.dataset.theme = "ice";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode */
    }
    setTheme(next);
  }

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

  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <a className="brand" href="#top" onClick={() => setOpen(false)}>
          <span className="mark">M</span>
          <span>
            <small>Portfolio</small>
            <strong>MAHI</strong>
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
            <a
              className="nav-cv"
              href={profile.links.cv}
              download="Minhajur_Rahman_Mahi_CV.pdf"
              onClick={() => setOpen(false)}
            >
              Download the CV
            </a>
          </nav>
          <button
            className={`theme-btn ${theme === "ice" ? "on" : ""}`}
            type="button"
            aria-pressed={theme === "ice"}
            aria-label={theme === "ice" ? "Switch to night theme" : "Switch to cool white theme"}
            onClick={toggleTheme}
          >
            {theme === "ice" ? (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M8.2 1.2a6.4 6.4 0 1 0 6.6 8.4A5.2 5.2 0 0 1 8.2 1.2Z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="3.1" fill="currentColor" />
                <path
                  fill="currentColor"
                  d="M7.2 1h1.6v2.2H7.2zm0 11.8h1.6V15H7.2zM1 7.2h2.2v1.6H1zm11.8 0H15v1.6h-2.2zM3.1 2.4l1.1-1.1 1.6 1.6-1.1 1.1zm7.1 7.1 1.1-1.1 1.6 1.6-1.1 1.1zM2.4 12.9l1.6-1.6 1.1 1.1-1.6 1.6zm7.1-7.1 1.6-1.6 1.1 1.1-1.6 1.6z"
                />
              </svg>
            )}
            {theme === "ice" ? "Night" : "White"}
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

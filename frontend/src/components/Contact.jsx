import { useState } from "react";
import { profile } from "../data.js";

const empty = { name: "", email: "", message: "", website: "" };

function readError(data) {
  if (!data) return "Could not send that message.";
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg).join(" ");
  }
  return "Could not send that message.";
}

export default function Contact() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState("idle");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setStatus("sending");
    setNote("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(readError(data));
      setStatus("sent");
      setNote("Saved. I’ll reply from this inbox.");
      setForm(empty);
    } catch (error) {
      setStatus("error");
      const offline = error instanceof TypeError;
      setNote(
        offline
          ? `API isn’t running. Email ${profile.email} directly.`
          : error.message,
      );
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  }

  return (
    <section id="contact">
      <div className="wrap contact-grid">
        <div className="contact-side">
          <p className="section-label">
            06 <span>Contact</span>
          </p>
          <h3 className="display">
            Have a system
            <br />
            that needs <em>building?</em>
          </h3>
          <p>
            ERP module, API, or a product that has to survive real use. Send a
            note — it lands in a local inbox this site’s FastAPI backend keeps.
          </p>
          <div className="contact-list">
            <button className="copy" type="button" onClick={copyEmail}>
              <span>
                <small>Email</small>
                <strong>{profile.email}</strong>
              </span>
              <small>{copied ? "Copied" : "Copy"}</small>
            </button>
            <a href={`tel:+8801715724712`}>
              <span>
                <small>Phone</small>
                <strong>{profile.phoneDisplay}</strong>
              </span>
            </a>
            <a href={profile.links.github} target="_blank" rel="noreferrer">
              <span>
                <small>GitHub</small>
                <strong>Mahi-markus</strong>
              </span>
              <small>↗</small>
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
              <span>
                <small>LinkedIn</small>
                <strong>Minhajur Rahman Mahi</strong>
              </span>
              <small>↗</small>
            </a>
            <a href={profile.links.leetcode} target="_blank" rel="noreferrer">
              <span>
                <small>LeetCode</small>
                <strong>mrahman61142</strong>
              </span>
              <small>↗</small>
            </a>
            <a href={profile.links.cv} download>
              <span>
                <small>CV</small>
                <strong>Download PDF</strong>
              </span>
              <small>↓</small>
            </a>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <label>
            <span>Name</span>
            <input
              name="name"
              value={form.name}
              onChange={update}
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
            />
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
            <span>Message</span>
            <textarea
              name="message"
              value={form.message}
              onChange={update}
              required
              minLength={10}
              maxLength={2000}
              placeholder="What are you building?"
            />
          </label>
          <label className="hp" aria-hidden="true">
            Website
            <input
              name="website"
              value={form.website}
              onChange={update}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
          <button className="btn" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
          <p className={`form-note ${status === "sent" ? "ok" : ""} ${status === "error" ? "bad" : ""}`} role="status">
            {note}
          </p>
        </form>
      </div>
    </section>
  );
}

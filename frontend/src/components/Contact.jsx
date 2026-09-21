import { useState } from "react";
import { api } from "../api.js";

const empty = { name: "", email: "", message: "", website: "" };

function readError(data) {
  if (!data) return "Could not send that message.";
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg).join(" ");
  }
  return "Could not send that message.";
}

export default function Contact({ profile, slug }) {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState("idle");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const links = profile.links || {};

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setStatus("sending");
    setNote("");
    try {
      await api.contact(slug, form);
      setStatus("sent");
      setNote("Saved. I’ll reply from this inbox.");
      setForm(empty);
    } catch (error) {
      setStatus("error");
      const offline = error instanceof TypeError;
      setNote(
        offline
          ? `API isn’t running. Email ${profile.email || "the owner"} directly.`
          : error.message || readError(null),
      );
    }
  }

  async function copyEmail() {
    if (!profile.email) return;
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
            note — it lands in this site’s inbox.
          </p>
          <div className="contact-list">
            {profile.email ? (
              <button className="copy" type="button" onClick={copyEmail}>
                <span>
                  <small>Email</small>
                  <strong>{profile.email}</strong>
                </span>
                <small>{copied ? "Copied" : "Copy"}</small>
              </button>
            ) : null}
            {profile.phoneDisplay ? (
              <a href={`tel:${profile.phone || profile.phoneDisplay}`}>
                <span>
                  <small>Phone</small>
                  <strong>{profile.phoneDisplay}</strong>
                </span>
              </a>
            ) : null}
            {links.github ? (
              <a href={links.github} target="_blank" rel="noreferrer">
                <span>
                  <small>GitHub</small>
                  <strong>{links.github.replace(/^https?:\/\/(www\.)?/, "")}</strong>
                </span>
                <small>↗</small>
              </a>
            ) : null}
            {links.linkedin ? (
              <a href={links.linkedin} target="_blank" rel="noreferrer">
                <span>
                  <small>LinkedIn</small>
                  <strong>{profile.name || "Profile"}</strong>
                </span>
                <small>↗</small>
              </a>
            ) : null}
            {links.leetcode ? (
              <a href={links.leetcode} target="_blank" rel="noreferrer">
                <span>
                  <small>LeetCode</small>
                  <strong>Profile</strong>
                </span>
                <small>↗</small>
              </a>
            ) : null}
            {links.cv ? (
              <a href={links.cv} download>
                <span>
                  <small>CV</small>
                  <strong>Download PDF</strong>
                </span>
                <small>↓</small>
              </a>
            ) : null}
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
          <p
            className={`form-note ${status === "sent" ? "ok" : ""} ${status === "error" ? "bad" : ""}`}
            role="status"
          >
            {note}
          </p>
        </form>
      </div>
    </section>
  );
}

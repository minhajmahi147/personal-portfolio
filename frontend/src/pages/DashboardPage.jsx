import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { emptyPortfolio, fontOptions, sceneOptions, skillCatalog, themeOptions } from "../data.js";

const tabs = [
  "Profile",
  "Hero",
  "Work",
  "Path",
  "Stack",
  "Publish",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default function DashboardPage() {
  const { user, loading, logout, refresh } = useAuth();
  const [tab, setTab] = useState("Profile");
  const [portfolio, setPortfolio] = useState(clone(emptyPortfolio));
  const [theme, setTheme] = useState("night");
  const [published, setPublished] = useState(false);
  const [slug, setSlug] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([api.getDashboard(), api.getMessages().catch(() => ({ messages: [] }))])
      .then(([dash, inbox]) => {
        if (cancelled) return;
        setPortfolio({ ...clone(emptyPortfolio), ...dash.portfolio });
        setTheme(dash.theme);
        setPublished(dash.published);
        setSlug(dash.slug);
        setMessages(inbox.messages || []);
        setReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const selectedSkills = useMemo(() => {
    const set = new Set();
    for (const group of portfolio.skillGroups || []) {
      for (const item of group.items || []) set.add(`${group.label}::${item.name}`);
    }
    return set;
  }, [portfolio.skillGroups]);

  if (loading) return <p className="page-status wrap">Checking session…</p>;
  if (!user) return <Navigate to="/login" replace />;

  function patchProfile(field, value) {
    setPortfolio((current) => ({
      ...current,
      profile: { ...current.profile, [field]: value },
    }));
  }

  function patchLink(field, value) {
    setPortfolio((current) => ({
      ...current,
      profile: {
        ...current.profile,
        links: { ...current.profile.links, [field]: value },
      },
    }));
  }

  function patchHero(field, value) {
    setPortfolio((current) => ({
      ...current,
      hero: { ...current.hero, [field]: value },
    }));
  }

  function patchAbout(field, value) {
    setPortfolio((current) => ({
      ...current,
      about: { ...current.about, [field]: value },
    }));
  }

  function patchEducation(field, value) {
    setPortfolio((current) => ({
      ...current,
      education: { ...current.education, [field]: value },
    }));
  }

  function patchStat(index, field, value) {
    setPortfolio((current) => {
      const stats = [...(current.stats || [])];
      stats[index] = { ...stats[index], [field]: value };
      return { ...current, stats };
    });
  }

  function addProject() {
    const index = String((portfolio.projects?.length || 0) + 1).padStart(2, "0");
    setPortfolio((current) => ({
      ...current,
      projects: [
        ...(current.projects || []),
        {
          id: `project-${Date.now()}`,
          index,
          title: "New project",
          status: "Shipped",
          blurb: "",
          stack: [],
          github: "",
          live: null,
          scene: "health",
        },
      ],
    }));
  }

  function updateProject(index, field, value) {
    setPortfolio((current) => {
      const projects = [...(current.projects || [])];
      projects[index] = { ...projects[index], [field]: value };
      return { ...current, projects };
    });
  }

  function removeProject(index) {
    setPortfolio((current) => ({
      ...current,
      projects: current.projects.filter((_, i) => i !== index),
    }));
  }

  function addJob() {
    setPortfolio((current) => ({
      ...current,
      experience: [
        ...(current.experience || []),
        {
          role: "Role",
          company: "Company",
          period: "",
          place: "",
          points: [""],
        },
      ],
    }));
  }

  function updateJob(index, field, value) {
    setPortfolio((current) => {
      const experience = [...(current.experience || [])];
      experience[index] = { ...experience[index], [field]: value };
      return { ...current, experience };
    });
  }

  function removeJob(index) {
    setPortfolio((current) => ({
      ...current,
      experience: current.experience.filter((_, i) => i !== index),
    }));
  }

  function toggleSkill(groupLabel, item) {
    setPortfolio((current) => {
      const groups = clone(current.skillGroups || []);
      let group = groups.find((entry) => entry.label === groupLabel);
      if (!group) {
        group = { label: groupLabel, items: [] };
        groups.push(group);
      }
      const exists = group.items.some((entry) => entry.name === item.name);
      group.items = exists
        ? group.items.filter((entry) => entry.name !== item.name)
        : [...group.items, item];
      return {
        ...current,
        skillGroups: groups.filter((entry) => entry.items.length),
        marquee: Array.from(
          new Set(
            groups.flatMap((entry) => entry.items.map((skill) => skill.name)),
          ),
        ).slice(0, 16),
      };
    });
  }

  async function saveAll() {
    setSaving(true);
    setStatus("");
    setError("");
    try {
      await api.savePortfolio(portfolio);
      await api.saveSettings({ theme, published });
      await refresh();
      setStatus("Saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    await logout();
  }

  if (!ready && !error) {
    return <p className="page-status wrap">Loading dashboard…</p>;
  }

  return (
    <div className="dashboard">
      <header className="dash-bar wrap">
        <div>
          <p className="section-label" style={{ marginBottom: "0.35rem" }}>
            Dashboard
          </p>
          <h1>{portfolio.profile.name || "Your portfolio"}</h1>
          <p className="dash-meta">
            Public URL: <Link to={`/u/${slug}`}>/u/{slug}</Link>
            {" · "}
            {published ? "Published" : "Draft"}
          </p>
        </div>
        <div className="dash-actions">
          {user.is_admin ? (
            <Link className="btn ghost" to="/admin">
              Admin
            </Link>
          ) : null}
          <Link className="btn ghost" to={`/u/${slug}`}>
            View site
          </Link>
          <button className="btn" type="button" onClick={saveAll} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button className="theme-btn" type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="dash-tabs wrap" role="tablist">
        {tabs.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            className={tab === name ? "on" : ""}
            aria-selected={tab === name}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="dash-panel wrap">
        {status ? <p className="form-note ok">{status}</p> : null}
        {error ? <p className="form-note bad">{error}</p> : null}

        {tab === "Profile" ? (
          <div className="dash-grid">
            <label>
              <span>Full name</span>
              <input
                value={portfolio.profile.name}
                onChange={(event) => patchProfile("name", event.target.value)}
              />
            </label>
            <label>
              <span>Role</span>
              <input
                value={portfolio.profile.role}
                onChange={(event) => patchProfile("role", event.target.value)}
              />
            </label>
            <label>
              <span>Location</span>
              <input
                value={portfolio.profile.location}
                onChange={(event) => patchProfile("location", event.target.value)}
              />
            </label>
            <label>
              <span>Availability</span>
              <input
                value={portfolio.profile.availability}
                onChange={(event) => patchProfile("availability", event.target.value)}
              />
            </label>
            <label>
              <span>Email</span>
              <input
                value={portfolio.profile.email}
                onChange={(event) => patchProfile("email", event.target.value)}
              />
            </label>
            <label>
              <span>Phone display</span>
              <input
                value={portfolio.profile.phoneDisplay}
                onChange={(event) => patchProfile("phoneDisplay", event.target.value)}
              />
            </label>
            <label className="full">
              <span>Summary</span>
              <textarea
                rows={4}
                value={portfolio.profile.summary}
                onChange={(event) => patchProfile("summary", event.target.value)}
              />
            </label>
            <label>
              <span>GitHub</span>
              <input
                value={portfolio.profile.links.github}
                onChange={(event) => patchLink("github", event.target.value)}
              />
            </label>
            <label>
              <span>LinkedIn</span>
              <input
                value={portfolio.profile.links.linkedin}
                onChange={(event) => patchLink("linkedin", event.target.value)}
              />
            </label>
            <label>
              <span>LeetCode</span>
              <input
                value={portfolio.profile.links.leetcode}
                onChange={(event) => patchLink("leetcode", event.target.value)}
              />
            </label>
            <label>
              <span>CV URL</span>
              <input
                value={portfolio.profile.links.cv}
                onChange={(event) => patchLink("cv", event.target.value)}
              />
            </label>
            {(portfolio.stats || []).map((stat, index) => (
              <div className="dash-pair" key={stat.label + index}>
                <label>
                  <span>Stat value</span>
                  <input
                    value={stat.value}
                    onChange={(event) => patchStat(index, "value", event.target.value)}
                  />
                </label>
                <label>
                  <span>Stat label</span>
                  <input
                    value={stat.label}
                    onChange={(event) => patchStat(index, "label", event.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "Hero" ? (
          <div className="dash-grid">
            <label>
              <span>Name line 1</span>
              <input
                value={portfolio.hero.nameLines?.[0] || ""}
                onChange={(event) =>
                  patchHero("nameLines", [
                    event.target.value,
                    portfolio.hero.nameLines?.[1] || "",
                  ])
                }
              />
            </label>
            <label>
              <span>Name line 2</span>
              <input
                value={portfolio.hero.nameLines?.[1] || ""}
                onChange={(event) =>
                  patchHero("nameLines", [
                    portfolio.hero.nameLines?.[0] || "",
                    event.target.value,
                  ])
                }
              />
            </label>
            <label>
              <span>Accent name</span>
              <input
                value={portfolio.hero.accent}
                onChange={(event) => patchHero("accent", event.target.value)}
              />
            </label>
            <label className="full">
              <span>Lead paragraph</span>
              <textarea
                rows={3}
                value={portfolio.hero.lead}
                onChange={(event) => patchHero("lead", event.target.value)}
              />
            </label>
            <label>
              <span>Pass role</span>
              <input
                value={portfolio.hero.passRole}
                onChange={(event) => patchHero("passRole", event.target.value)}
              />
            </label>
            <label>
              <span>Pass tag</span>
              <input
                value={portfolio.hero.passTag}
                onChange={(event) => patchHero("passTag", event.target.value)}
              />
            </label>
            <label>
              <span>Now</span>
              <input
                value={portfolio.hero.now}
                onChange={(event) => patchHero("now", event.target.value)}
              />
            </label>
            <label>
              <span>Focus</span>
              <input
                value={portfolio.hero.focus}
                onChange={(event) => patchHero("focus", event.target.value)}
              />
            </label>
            <label>
              <span>Base</span>
              <input
                value={portfolio.hero.base}
                onChange={(event) => patchHero("base", event.target.value)}
              />
            </label>
            <label className="full">
              <span>About headline line 1</span>
              <input
                value={portfolio.about.headline?.[0] || ""}
                onChange={(event) =>
                  patchAbout("headline", [
                    event.target.value,
                    portfolio.about.headline?.[1] || "",
                  ])
                }
              />
            </label>
            <label>
              <span>About headline line 2</span>
              <input
                value={portfolio.about.headline?.[1] || ""}
                onChange={(event) =>
                  patchAbout("headline", [
                    portfolio.about.headline?.[0] || "",
                    event.target.value,
                  ])
                }
              />
            </label>
            <label>
              <span>About emphasis</span>
              <input
                value={portfolio.about.emphasis}
                onChange={(event) => patchAbout("emphasis", event.target.value)}
              />
            </label>
            <label className="full">
              <span>About secondary</span>
              <textarea
                rows={3}
                value={portfolio.about.secondary}
                onChange={(event) => patchAbout("secondary", event.target.value)}
              />
            </label>
            <label>
              <span>Degree</span>
              <input
                value={portfolio.education.degree}
                onChange={(event) => patchEducation("degree", event.target.value)}
              />
            </label>
            <label>
              <span>School</span>
              <input
                value={portfolio.education.school}
                onChange={(event) => patchEducation("school", event.target.value)}
              />
            </label>
            <label>
              <span>Period</span>
              <input
                value={portfolio.education.period}
                onChange={(event) => patchEducation("period", event.target.value)}
              />
            </label>
            <label>
              <span>Note</span>
              <input
                value={portfolio.education.note}
                onChange={(event) => patchEducation("note", event.target.value)}
              />
            </label>
          </div>
        ) : null}

        {tab === "Work" ? (
          <div className="dash-stack">
            <button className="btn ghost" type="button" onClick={addProject}>
              Add project
            </button>
            {(portfolio.projects || []).map((project, index) => (
              <article className="dash-card" key={project.id}>
                <div className="dash-grid">
                  <label>
                    <span>Title</span>
                    <input
                      value={project.title}
                      onChange={(event) => updateProject(index, "title", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Status</span>
                    <input
                      value={project.status}
                      onChange={(event) => updateProject(index, "status", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Index</span>
                    <input
                      value={project.index}
                      onChange={(event) => updateProject(index, "index", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Scene</span>
                    <select
                      value={project.scene}
                      onChange={(event) => updateProject(index, "scene", event.target.value)}
                    >
                      {sceneOptions.map((scene) => (
                        <option key={scene} value={scene}>
                          {scene}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="full">
                    <span>Blurb</span>
                    <textarea
                      rows={3}
                      value={project.blurb}
                      onChange={(event) => updateProject(index, "blurb", event.target.value)}
                    />
                  </label>
                  <label className="full">
                    <span>Stack (comma separated)</span>
                    <input
                      value={(project.stack || []).join(", ")}
                      onChange={(event) =>
                        updateProject(
                          index,
                          "stack",
                          event.target.value
                            .split(",")
                            .map((part) => part.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                  </label>
                  <label>
                    <span>GitHub</span>
                    <input
                      value={project.github || ""}
                      onChange={(event) => updateProject(index, "github", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Live URL</span>
                    <input
                      value={project.live || ""}
                      onChange={(event) =>
                        updateProject(index, "live", event.target.value || null)
                      }
                    />
                  </label>
                </div>
                <button className="theme-btn" type="button" onClick={() => removeProject(index)}>
                  Remove
                </button>
              </article>
            ))}
          </div>
        ) : null}

        {tab === "Path" ? (
          <div className="dash-stack">
            <button className="btn ghost" type="button" onClick={addJob}>
              Add role
            </button>
            {(portfolio.experience || []).map((job, index) => (
              <article className="dash-card" key={`${job.company}-${index}`}>
                <div className="dash-grid">
                  <label>
                    <span>Role</span>
                    <input
                      value={job.role}
                      onChange={(event) => updateJob(index, "role", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Company</span>
                    <input
                      value={job.company}
                      onChange={(event) => updateJob(index, "company", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Period</span>
                    <input
                      value={job.period}
                      onChange={(event) => updateJob(index, "period", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Place</span>
                    <input
                      value={job.place}
                      onChange={(event) => updateJob(index, "place", event.target.value)}
                    />
                  </label>
                  <label className="full">
                    <span>Points (one per line)</span>
                    <textarea
                      rows={5}
                      value={(job.points || []).join("\n")}
                      onChange={(event) =>
                        updateJob(
                          index,
                          "points",
                          event.target.value
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                  </label>
                </div>
                <button className="theme-btn" type="button" onClick={() => removeJob(index)}>
                  Remove
                </button>
              </article>
            ))}
          </div>
        ) : null}

        {tab === "Stack" ? (
          <div className="dash-stack">
            <p className="form-note">Select the tools that appear on your site.</p>
            {skillCatalog.map((group) => (
              <div className="dash-card" key={group.label}>
                <h3>{group.label}</h3>
                <div className="skill-pick">
                  {group.items.map((item) => {
                    const key = `${group.label}::${item.name}`;
                    const on = selectedSkills.has(key);
                    return (
                      <button
                        key={item.name}
                        type="button"
                        className={on ? "on" : ""}
                        onClick={() => toggleSkill(group.label, item)}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "Publish" ? (
          <div className="dash-stack">
            <div className="dash-card">
              <h3>Theme</h3>
              <div className="dash-actions">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`theme-btn ${theme === option.id ? "on" : ""}`}
                    aria-pressed={theme === option.id}
                    onClick={() => setTheme(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="dash-card">
              <h3>Fonts</h3>
              <div className="dash-actions">
                {fontOptions.map((option) => {
                  const on = (portfolio.font || "default") === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`theme-btn ${on ? "on" : ""}`}
                      aria-pressed={on}
                      style={{ fontFamily: option.family }}
                      onClick={() => setPortfolio((current) => ({ ...current, font: option.id }))}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="dash-card">
              <h3>Visibility</h3>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(event) => setPublished(event.target.checked)}
                />
                <span>Published — anyone can open /u/{slug}</span>
              </label>
              <p className="form-note">
                Draft sites are only visible while you are signed in as the owner.
              </p>
            </div>
            <div className="dash-card">
              <h3>Inbox ({messages.length})</h3>
              {messages.length ? (
                <ul className="message-list">
                  {messages.map((message) => (
                    <li key={message.id}>
                      <strong>
                        {message.name} · {message.email}
                      </strong>
                      <span>{message.message}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="form-note">No messages yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

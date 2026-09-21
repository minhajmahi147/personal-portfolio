import { useEffect, useState } from "react";
import Scene from "./Scene.jsx";

export default function Projects({ projects = [] }) {
  const [activeId, setActiveId] = useState(projects[0]?.id || "");
  const active = projects.find((project) => project.id === activeId) ?? projects[0];

  useEffect(() => {
    if (!projects.some((project) => project.id === activeId)) {
      setActiveId(projects[0]?.id || "");
    }
  }, [projects, activeId]);

  if (!projects.length) {
    return (
      <section id="work">
        <div className="wrap">
          <p className="section-label">
            02 <span>Selected work</span>
          </p>
          <h3 className="display">No projects yet.</h3>
        </div>
      </section>
    );
  }

  return (
    <section id="work">
      <div className="wrap">
        <p className="section-label">
          02 <span>Selected work</span>
        </p>
        <h3 className="display" style={{ marginBottom: "1.8rem" }}>
          Selected systems, <em>not slides.</em>
        </h3>
        <div className="work-layout">
          <div className="project-list" role="list">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                role="listitem"
                className={`project-btn ${project.id === active?.id ? "active" : ""}`}
                onMouseEnter={() => setActiveId(project.id)}
                onFocus={() => setActiveId(project.id)}
                onClick={() => setActiveId(project.id)}
              >
                <span className="idx">{project.index}</span>
                <span>
                  <h3>{project.title}</h3>
                  <p>{(project.stack || []).slice(0, 3).join(" · ")}</p>
                </span>
                <span className="tag">{project.status}</span>
              </button>
            ))}
          </div>

          {active ? (
            <article className="preview" aria-live="polite">
              <Scene type={active.scene} />
              <div className="preview-body">
                <h3>{active.title}</h3>
                <p>{active.blurb}</p>
                <div className="stack">
                  {(active.stack || []).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <div className="preview-links">
                  {active.github ? (
                    <a className="linkish" href={active.github} target="_blank" rel="noreferrer">
                      GitHub ↗
                    </a>
                  ) : null}
                  {active.live ? (
                    <a className="linkish" href={active.live} target="_blank" rel="noreferrer">
                      Live ↗
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}

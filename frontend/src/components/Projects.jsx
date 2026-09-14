import { useState } from "react";
import { projects } from "../data.js";
import Scene from "./Scene.jsx";

export default function Projects() {
  const [activeId, setActiveId] = useState(projects[0].id);
  const active = projects.find((project) => project.id === activeId) ?? projects[0];

  return (
    <section id="work">
      <div className="wrap">
        <p className="section-label">
          02 <span>Selected work</span>
        </p>
        <h3 className="display" style={{ marginBottom: "1.8rem" }}>
          Six systems, <em>not slides.</em>
        </h3>
        <div className="work-layout">
          <div className="project-list" role="list">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                role="listitem"
                className={`project-btn ${project.id === active.id ? "active" : ""}`}
                onMouseEnter={() => setActiveId(project.id)}
                onFocus={() => setActiveId(project.id)}
                onClick={() => setActiveId(project.id)}
              >
                <span className="idx">{project.index}</span>
                <span>
                  <h3>{project.title}</h3>
                  <p>{project.stack.slice(0, 3).join(" · ")}</p>
                </span>
                <span className="tag">{project.status}</span>
              </button>
            ))}
          </div>

          <article className="preview" aria-live="polite">
            <Scene type={active.scene} />
            <div className="preview-body">
              <h3>{active.title}</h3>
              <p>{active.blurb}</p>
              <div className="stack">
                {active.stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <div className="preview-links">
                <a className="linkish" href={active.github} target="_blank" rel="noreferrer">
                  GitHub ↗
                </a>
                {active.live && (
                  <a className="linkish" href={active.live} target="_blank" rel="noreferrer">
                    Live ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

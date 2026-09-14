import { useState } from "react";
import { education, skillGroups } from "../data.js";
import SkillMark from "./icon_source.jsx";

export default function Skills() {
  const [pinned, setPinned] = useState(null);

  function track(event) {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--x", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--y", `${event.clientY - box.top}px`);
  }

  function toggle(group, item) {
    setPinned((current) =>
      current?.group === group && current?.item === item ? null : { group, item },
    );
  }

  return (
    <section id="stack">
      <div className="wrap">
        <p className="section-label">
          04 <span>Stack</span>
        </p>
        <h3 className="display" style={{ marginBottom: "0.7rem" }}>
          Tools I actually <em>reach for.</em>
        </h3>
        <p className="stack-hint" aria-live="polite">
          {pinned ? (
            <>
              Pinned <em>{pinned.item}</em>
              <span>{pinned.group}</span>
            </>
          ) : (
            "Click a tool to pin it."
          )}
        </p>
        <div className="skill-grid">
          {skillGroups.map((group) => (
            <div className="skill-col" key={group.label} onMouseMove={track}>
              <h3>{group.label}</h3>
              <ol>
                {group.items.map((item) => {
                  const on = pinned?.group === group.label && pinned?.item === item.name;
                  return (
                    <li key={item.name}>
                      <button
                        type="button"
                        className={on ? "on" : ""}
                        aria-pressed={on}
                        onClick={() => toggle(group.label, item.name)}
                      >
                        <SkillMark icon={item.icon} color={item.color} />
                        {item.name}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>

        <div className="edu" style={{ marginTop: "2.4rem" }}>
          <div>
            <p className="section-label" style={{ marginBottom: 0 }}>
              05 <span>Education</span>
            </p>
            <h3>{education.degree}</h3>
            <p>{education.school}</p>
          </div>
          <div className="edu-side">
            {education.period}
            <b>{education.note}</b>
          </div>
        </div>
      </div>
    </section>
  );
}

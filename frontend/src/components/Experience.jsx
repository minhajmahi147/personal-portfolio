import { experience } from "../data.js";

export default function Experience() {
  return (
    <section id="path">
      <div className="wrap">
        <p className="section-label">
          03 <span>Path</span>
        </p>
        <h3 className="display" style={{ marginBottom: "1.6rem" }}>
          Where the work <em>landed.</em>
        </h3>
        <div className="jobs">
          {experience.map((job) => (
            <article className="job" key={job.company}>
              <div className="when">
                {job.period}
                <strong>{job.place}</strong>
              </div>
              <div>
                <h3>{job.role}</h3>
                <p className="meta">{job.company}</p>
                <ul>
                  {job.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

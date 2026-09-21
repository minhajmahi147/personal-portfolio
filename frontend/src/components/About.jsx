export default function About({ profile, about }) {
  const principles = about?.principles || [];
  return (
    <section id="about">
      <div className="wrap about-grid">
        <div>
          <p className="section-label">
            01 <span>About</span>
          </p>
          <h3 className="display">
            {(about?.headline || []).map((line, index) => (
              <span key={`${line}-${index}`}>
                {line}
                <br />
              </span>
            ))}
            <em>{about?.emphasis}</em>
          </h3>
        </div>
        <div className="about-copy">
          {profile.summary ? <p>{profile.summary}</p> : null}
          {about?.secondary ? <p>{about.secondary}</p> : null}
          <div className="principles">
            {principles.map((item) => (
              <article className="principle" key={item.k}>
                <i>{item.k}</i>
                <b>{item.t}</b>
                <p>{item.d}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

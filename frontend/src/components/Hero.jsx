export default function Hero({ profile, hero }) {
  const city = profile.location?.split(",").pop()?.trim() || hero.base || "";
  return (
    <section className="hero wrap" id="top">
      <div>
        <p className="kicker reveal">
          <span className="pulse" aria-hidden="true" />
          {profile.availability}
          {city ? ` · ${city}` : ""}
        </p>
        <h1 className="reveal d1">
          {(hero.nameLines || []).map((line, index) => (
            <span key={`${line}-${index}`}>
              {line}
              <br />
            </span>
          ))}
          <br className="break-sm" />
          <em>{hero.accent}</em>
        </h1>
        <p className="lead reveal d2">{hero.lead}</p>
        <div className="actions reveal d3">
          <a className="btn" href="#work">
            Selected work
          </a>
          <a className="btn ghost" href="#contact">
            Start a conversation
          </a>
        </div>
      </div>

      <aside className="pass reveal d2" aria-label="Engineer pass">
        <div className="pass-shadow" aria-hidden="true" />
        <div className="pass-card">
          <div className="pass-top">
            <span>{hero.passLabel}</span>
            <span>{hero.passTag}</span>
          </div>
          <div className="strip" />
          <div className="sigil" aria-hidden="true">
            <span className="sigil-mark">
              {hero.sigilLeft}
              <em>{hero.sigilRight}</em>
            </span>
            <span className="sigil-meta">{hero.sigilMeta}</span>
          </div>
          <h2>{profile.name || "Your name"}</h2>
          <p className="pass-role">{hero.passRole || profile.role}</p>
          <div className="pass-rows">
            <div className="pass-row">
              <span>Now</span>
              <b>{hero.now}</b>
            </div>
            <div className="pass-row">
              <span>Focus</span>
              <b>{hero.focus}</b>
            </div>
            <div className="pass-row">
              <span>Base</span>
              <b>{hero.base}</b>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}

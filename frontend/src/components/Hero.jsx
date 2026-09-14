import { profile } from "../data.js";

export default function Hero() {
  return (
    <section className="hero wrap" id="top">
      <div>
        <p className="kicker reveal">
          <span className="pulse" aria-hidden="true" />
          {profile.availability} · Dhaka
        </p>
        <h1 className="reveal d1">
          Minhajur
          <br />
          Rahman
          <br className="break-sm" />
          <em>Mahi</em>
        </h1>
        <p className="lead reveal d2">
          I build ERP systems and web applications that hold up in daily
          operations — schema, APIs, workflows, and the screen someone actually
          clicks.
        </p>
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
            <span>Engineer pass</span>
            <span>MRM · 26</span>
          </div>
          <div className="strip" />
          <div className="sigil" aria-hidden="true">
            <span className="sigil-mark">
              M<em>R</em>
            </span>
            <span className="sigil-meta">Dhaka · CSE</span>
          </div>
          <h2>Minhajur Rahman Mahi</h2>
          <p className="pass-role">Full-stack · ERP & web apps</p>
          <div className="pass-rows">
            <div className="pass-row">
              <span>Now</span>
              <b>Fusion Infotech</b>
            </div>
            <div className="pass-row">
              <span>Focus</span>
              <b>ERPNext · REST</b>
            </div>
            <div className="pass-row">
              <span>Base</span>
              <b>Dhaka</b>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}

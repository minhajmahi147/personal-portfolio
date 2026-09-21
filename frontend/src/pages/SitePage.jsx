import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import About from "../components/About.jsx";
import Contact from "../components/Contact.jsx";
import Experience from "../components/Experience.jsx";
import Footer from "../components/Footer.jsx";
import Hero from "../components/Hero.jsx";
import Nav from "../components/Nav.jsx";
import Projects from "../components/Projects.jsx";
import Skills from "../components/Skills.jsx";
import Strip from "../components/Strip.jsx";
import { emptyPortfolio } from "../data.js";

export default function SitePage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .getSite(slug)
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setError(err.message || "Site not found");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <p className="page-status wrap">Loading site…</p>;
  }

  if (error || !data) {
    return (
      <div className="page-status wrap">
        <h1>Site not found</h1>
        <p>{error || "This portfolio is missing or unpublished."}</p>
        <p>
          <Link to="/">Back home</Link>
        </p>
      </div>
    );
  }

  const portfolio = { ...emptyPortfolio, ...data.portfolio };
  const profile = portfolio.profile || emptyPortfolio.profile;
  const mark = (profile.name || "P").trim().charAt(0).toUpperCase() || "P";

  return (
    <>
      <a className="skip" href="#about">
        Skip to content
      </a>
      {data.owner && !data.published ? (
        <div className="owner-banner">
          Draft preview — only you can see this.{" "}
          <Link to="/dashboard">Publish from dashboard</Link>
        </div>
      ) : null}
      <Nav profile={profile} theme={data.theme} brandMark={mark} />
      <main>
        <div className="hero-shell">
          <Hero profile={profile} hero={portfolio.hero || emptyPortfolio.hero} />
          <Strip stats={portfolio.stats} marquee={portfolio.marquee} />
        </div>
        <About profile={profile} about={portfolio.about || emptyPortfolio.about} />
        <Projects projects={portfolio.projects} />
        <Experience experience={portfolio.experience} />
        <Skills skillGroups={portfolio.skillGroups} education={portfolio.education} />
        <Contact profile={profile} slug={data.slug} />
      </main>
      <Footer profile={profile} />
    </>
  );
}

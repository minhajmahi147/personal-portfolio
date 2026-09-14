import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";
import Experience from "./components/Experience.jsx";
import Footer from "./components/Footer.jsx";
import Hero from "./components/Hero.jsx";
import Nav from "./components/Nav.jsx";
import Projects from "./components/Projects.jsx";
import Skills from "./components/Skills.jsx";
import Strip from "./components/Strip.jsx";

export default function App() {
  return (
    <>
      <a className="skip" href="#about">
        Skip to content
      </a>
      <Nav />
      <main>
        <div className="hero-shell">
          <Hero />
          <Strip />
        </div>
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

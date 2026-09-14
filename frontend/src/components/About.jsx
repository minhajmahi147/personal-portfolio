import { profile } from "../data.js";

const principles = [
  // {
  //   k: "01",
  //   t: "End to end",
  //   d: "Schema, backend logic, automated workflows, and the interface around them.",
  // },
  // {
  //   k: "02",
  //   t: "Systems people run",
  //   d: "Payroll, leave, provident fund, stock, tickets — work that shows up every morning.",
  // },
  // {
  //   k: "03",
  //   t: "Shipped, not sketched",
  //   d: "Docker, tests, and API docs so the next person can actually run it.",
  // },
];

export default function About() {
  return (
    <section id="about">
      <div className="wrap about-grid">
        <div>
          <p className="section-label">
            01 <span>About</span>
          </p>
          <h3 className="display">
            Close to two years
            <br />
            inside <em>real systems.</em>
          </h3>
        </div>
        <div className="about-copy">
          <p>{profile.summary}</p>
          <p>
            Comfortable owning a feature from the table to the approval chain.
            Most of that work has been ERPNext and Frappe, plus REST APIs and
            the React or Next.js surfaces in front of them.
          </p>
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

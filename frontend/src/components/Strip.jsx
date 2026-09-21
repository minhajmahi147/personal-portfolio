export default function Strip({ stats = [], marquee = [] }) {
  const loop = marquee.length ? [...marquee, ...marquee] : [];

  return (
    <>
      <div className="band">
        <div className="stats wrap" aria-label="Snapshot">
          {stats.map((stat) => (
            <div className="stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      {loop.length > 0 ? (
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {loop.map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

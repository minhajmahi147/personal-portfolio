export default function Scene({ type }) {
  if (type === "health") {
    return (
      <div className="scene scene-health" aria-hidden="true">
        <div className="cross" />
        <div className="pill a" />
        <div className="pill b" />
        <div className="pill c" />
        <span className="scene-label">Rx · Groq plans</span>
      </div>
    );
  }
  if (type === "editorial") {
    return (
      <div className="scene scene-editorial" aria-hidden="true">
        <div className="cols">
          <div className="col" />
          <div className="col" />
          <div className="col" />
        </div>
        <span className="scene-label">Draft → review → live</span>
      </div>
    );
  }
  if (type === "tuition") {
    return (
      <div className="scene scene-tuition" aria-hidden="true">
        <div className="profile one" />
        <div className="profile two" />
        <span className="scene-label">Class · area · medium</span>
      </div>
    );
  }
  if (type === "radar") {
    return (
      <div className="scene scene-radar" aria-hidden="true">
        <div className="ring" />
        <div className="ring r2" />
        <div className="ring r3" />
        <span className="scene-label">Search · dest · time</span>
      </div>
    );
  }
  if (type === "map") {
    return (
      <div className="scene scene-map" aria-hidden="true">
        <div className="gridlines" />
        <div className="pin" />
        <span className="scene-label">PostGIS listings</span>
      </div>
    );
  }
  return (
    <div className="scene scene-hotel" aria-hidden="true">
      <div className="room r1" />
      <div className="room r2" />
      <div className="room r3" />
      <span className="scene-label">Rooms · slugs · uploads</span>
    </div>
  );
}

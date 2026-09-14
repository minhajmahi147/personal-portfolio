const marks = {
  java: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#E76F00" d="M8.2 16.6c1.6 1.1 4.4.5 4.4.5s-.8 1.3-2.6 1.3c-1.5 0-2.6-.7-1.8-1.8Z" />
      <path fill="#5382A1" d="M12.4 10.2s-1 .6.7.9c2 .3 3 .2 5-.3 0 0 .5.4-.2.7-2.5 1.1-5.8 1.2-5.5-1.3Z" />
      <path fill="#E76F00" d="M8.8 13.4s-1.1.8.6 1c2 .2 3.6.2 6.2-.4 0 0 .4.4-.1.8-2.4 1.3-7.1 1-6.7-1.4Z" />
      <path fill="#5382A1" d="M15.2 8.4c1.2 1.4-.3 2.6-.3 2.6s3-.1 1.6-3.1c-1.3-2.6-2.3-3.9 3.1-8.4 0 0-8.6 2.2-4.4 8.9Z" />
      <path fill="#E76F00" d="M9.4 19.8s-3.6 1.1-1.2 1.5c1 .2 3 .1 4.8-.2 1.4-.2 2.8-.8.8-1.2-.6-.1-1.8 0-1.8 0s.4-.7-2.6-.1Z" />
    </svg>
  ),
  beego: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#F6C343" d="M12 2.2 20.2 7v10L12 21.8 3.8 17V7L12 2.2Z" />
      <path fill="#1a1408" d="M9.2 10.2a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Zm5.6 0a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2ZM8.4 13.4c.8 1.6 2 2.3 3.6 2.3s2.8-.7 3.6-2.3c-.9.7-2.1 1-3.6 1s-2.7-.3-3.6-1Z" />
    </svg>
  ),
  mssql: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" fill="#CC2927" />
      <path fill="#E85D4C" d="M5 6v5c0 1.7 3.1 3 7 3s7-1.3 7-3V6c0 1.7-3.1 3-7 3S5 7.7 5 6Z" />
      <path fill="#CC2927" d="M5 11v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5c0 1.7-3.1 3-7 3s-7-1.3-7-3Z" />
    </svg>
  ),
  postgis: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4169E1" d="M4 5h16v11H4z" opacity=".35" />
      <path fill="none" stroke="#E6FF3C" strokeWidth="1.2" d="M4 8.5h16M4 12h16M9 5v11M15 5v11" />
      <path fill="#E6FF3C" d="M12 7.2c-1.8 0-3.2 1.3-3.2 3.1 0 2.4 3.2 5.5 3.2 5.5s3.2-3.1 3.2-5.5c0-1.8-1.4-3.1-3.2-3.1Zm0 4.2a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z" />
    </svg>
  ),
};

export default function SkillMark({ icon, color }) {
  if (marks[icon]) return <span className="skill-logo">{marks[icon]}</span>;
  return (
    <span className="skill-logo">
      <img
        src={`https://cdn.simpleicons.org/${icon}/${color}`}
        alt=""
        width="22"
        height="22"
      />
    </span>
  );
}

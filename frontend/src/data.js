export const emptyPortfolio = {
  profile: {
    name: "",
    role: "Full-Stack Software Engineer",
    location: "",
    email: "",
    phone: "",
    phoneDisplay: "",
    availability: "Open to opportunities",
    summary: "",
    links: { github: "", linkedin: "", leetcode: "", cv: "" },
  },
  hero: {
    nameLines: ["Your", "Name"],
    accent: "Here",
    lead: "Tell visitors what you build and why it matters.",
    passLabel: "Engineer pass",
    passTag: "YOU",
    passRole: "Full-stack",
    sigilLeft: "Y",
    sigilRight: "N",
    sigilMeta: "Your city",
    now: "Your company",
    focus: "Your focus",
    base: "Your city",
  },
  about: {
    headline: ["Build your story", "around"],
    emphasis: "real work.",
    secondary: "Add a second paragraph about how you work.",
    principles: [],
  },
  stats: [
    { value: "1", label: "year shipping" },
    { value: "—", label: "daily craft" },
    { value: "0", label: "selected builds" },
    { value: "—", label: "based in" },
  ],
  experience: [],
  projects: [],
  skillGroups: [],
  education: { degree: "", school: "", period: "", note: "" },
  marquee: [],
};

export const skillCatalog = [
  {
    label: "Languages",
    items: [
      { name: "Python", icon: "python", color: "3776AB" },
      { name: "JavaScript", icon: "javascript", color: "F7DF1E" },
      { name: "TypeScript", icon: "typescript", color: "3178C6" },
      { name: "Golang", icon: "go", color: "00ADD8" },
      { name: "Java", icon: "java", color: "E76F00" },
    ],
  },
  {
    label: "Frontend",
    items: [
      { name: "React.js", icon: "react", color: "61DAFB" },
      { name: "Next.js", icon: "nextdotjs", color: "FFFFFF" },
    ],
  },
  {
    label: "Backend",
    items: [
      { name: "Frappe", icon: "frappe", color: "0089FF" },
      { name: "Django", icon: "django", color: "44B78B" },
      { name: "Flask", icon: "flask", color: "FFFFFF" },
      { name: "FastAPI", icon: "fastapi", color: "009688" },
      { name: "Node.js", icon: "nodedotjs", color: "5FA04E" },
      { name: "Express.js", icon: "express", color: "FFFFFF" },
      { name: "Beego", icon: "beego", color: "F6C343" },
    ],
  },
  {
    label: "Data",
    items: [
      { name: "PostgreSQL", icon: "postgresql", color: "4169E1" },
      { name: "MariaDB", icon: "mariadb", color: "C0765A" },
      { name: "MongoDB", icon: "mongodb", color: "47A248" },
      { name: "Microsoft SQL Server", icon: "mssql", color: "CC2927" },
      { name: "PostGIS", icon: "postgis", color: "E6FF3C" },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "Docker", icon: "docker", color: "2496ED" },
      { name: "Git", icon: "git", color: "F05032" },
      { name: "GitHub", icon: "github", color: "FFFFFF" },
      { name: "GitLab", icon: "gitlab", color: "FC6D26" },
      { name: "Elasticsearch", icon: "elasticsearch", color: "FEC514" },
      { name: "Kibana", icon: "kibana", color: "F04E98" },
      { name: "Postman", icon: "postman", color: "FF6C37" },
      { name: "Selenium", icon: "selenium", color: "43B02A" },
      { name: "QGIS", icon: "qgis", color: "589632" },
    ],
  },
];

export const sceneOptions = ["health", "editorial", "tuition", "radar", "map", "hotel"];

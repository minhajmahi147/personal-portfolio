export const profile = {
  name: "Minhajur Rahman Mahi",
  role: "Full-Stack Software Engineer",
  location: "Mirbag, Modhubag, Dhaka",
  email: "mrahman61142@gmail.com",
  phone: "01715724712",
  phoneDisplay: "+880 1715-724712",
  availability: "Open to opportunities",
  summary:
    "Full-stack developer with close to two years of experience building ERP systems and web applications in Python, JavaScript, and TypeScript. I specialize in ERPNext and Frappe customization, REST API design, and MariaDB-backed systems — from HR and payroll modules through to the screens people use every day.",
  links: {
    github: "https://github.com/Mahi-markus",
    linkedin: "https://www.linkedin.com/in/minhajur-rahman-mahi-2a535a200/",
    leetcode: "https://leetcode.com/u/mrahman61142/",
    cv: "/Minhajur_Rahman_Mahi_CV.pdf",
  },
};

export const stats = [
  { value: "2 yrs", label: "shipping software" },
  { value: "ERPNext", label: "daily craft" },
  { value: "6", label: "selected builds" },
  { value: "Dhaka", label: "based in Bangladesh" },
];

export const experience = [
  {
    role: "Junior Software Engineer",
    company: "Fusion Infotech Limited",
    period: "May 2025 — Present",
    place: "Dhaka",
    points: [
      "Built a Provident Fund system in ERPNext covering PF loans, payroll-linked automated deductions, employee-wise ledgers, and validation rules.",
      "Delivered core HR: payroll processing, leave policy, staff loans, and a bulk employee ID card generator.",
      "Extended Project Management, Buying, Selling, Stock, and Asset modules so operations run end to end.",
      "Customized support with ticket management, check-in reporting, and route-based salesman tracking.",
      "Designed automated approval workflows — including sales route assignment — to cut daily back-and-forth.",
    ],
  },
  {
    role: "Intern Software Engineer",
    company: "W3 Engineers Ltd",
    period: "Nov 2024 — Feb 2025",
    place: "Dhaka, Bangladesh",
    points: [
      "Developed REST APIs that powered multiple applications.",
      "Built a content management system with Django, Next.js, and PostgreSQL.",
      "Shipped a Flight Details system with Elasticsearch, Beego, and Swagger — search, docs, and a full Docker setup.",
      "Dockerized every delivered project so environments stayed consistent across the team.",
      "Wrote and ran unit tests to catch regressions before they reached the rest of the team.",
    ],
  },
];

export const projects = [
  {
    id: "meds",
    index: "01",
    title: "LLM Integrated Medication System",
    status: "In development",
    blurb:
      "A healthcare assistant where people register, save a health profile, and receive Groq diet and exercise plans. Prescription PDFs become medicine details staff can review.",
    stack: ["React", "TypeScript", "Django REST", "PostgreSQL", "Groq"],
    github: "https://github.com/minhajmahi147/healthcare-llm",
    live: null,
    scene: "health",
  },
  {
    id: "cms",
    index: "02",
    title: "Content Distribution Engine",
    status: "Shipped",
    blurb:
      "Admins assign articles to writers, then review, comment, and approve. Paired with a Next.js editor and a Dockerized Django backend.",
    stack: ["Django", "Next.js", "Docker"],
    github: "https://github.com/Mahi-markus/Content-Management-System",
    live: null,
    scene: "editorial",
  },
  {
    id: "tuition",
    index: "03",
    title: "SmartTution",
    status: "Live",
    blurb:
      "Students and tutors register, browse profiles, and post tuition requests by class, area, and medium.",
    stack: ["React", "Node.js", "Express", "MongoDB"],
    github: "https://github.com/Mahi-markus/tutor-management-platform",
    live: "https://tutor-management-platform-lac.vercel.app/",
    scene: "tuition",
  },
  {
    id: "flight",
    index: "04",
    title: "Flight Details System",
    status: "Shipped",
    blurb:
      "Search flights by parameters, or by destination and time. Elasticsearch for speed, Swagger for the contract, Docker and unit tests around the rest.",
    stack: ["Golang", "Beego", "Elasticsearch", "Swagger", "Docker"],
    github: "https://github.com/uzzalcse/flight-details",
    live: null,
    scene: "radar",
  },
  {
    id: "property",
    index: "05",
    title: "Property Management System",
    status: "Shipped",
    blurb:
      "Accommodation listings with PostGIS locations, owner signup, role-based admin, and multilingual descriptions.",
    stack: ["Django", "PostgreSQL", "PostGIS", "Docker"],
    github: "https://github.com/Mahi-markus/Inventory_Management",
    live: null,
    scene: "map",
  },
  {
    id: "hotel",
    index: "06",
    title: "Hotel Management API",
    status: "Shipped",
    blurb:
      "Create, update, and fetch hotels and rooms, with image upload, slug lookup, and Jest tests. Next.js detail pages on the frontend.",
    stack: ["Next.js", "Express", "TypeScript", "Jest"],
    github: "https://github.com/Mahi-markus/Hotel_Manage_API",
    live: null,
    scene: "hotel",
  },
];

export const skillGroups = [
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

export const education = {
  degree: "B.Sc. in Computer Science and Engineering",
  school: "Ahsanullah University of Science and Technology",
  period: "2020 — 2024",
  note: "CGPA 3.17",
};

export const marquee = [
  "Python",
  "ERPNext",
  "Frappe",
  "React",
  "TypeScript",
  "Django",
  "FastAPI",
  "PostgreSQL",
  "MariaDB",
  "Docker",
  "Next.js",
  "Golang",
  "Elasticsearch",
];

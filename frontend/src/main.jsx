import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

try {
  if (localStorage.getItem("theme") === "ice") {
    document.documentElement.dataset.theme = "ice";
  }
} catch {
  /* private mode */
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

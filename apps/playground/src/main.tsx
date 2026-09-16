import { ThemeProvider } from "@quickadui/theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Root } from "./Root";
import "./index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("#root element not found");
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  </StrictMode>,
);

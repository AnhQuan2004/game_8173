import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@coinbase/onchainkit/styles.css";
import { AppProviders } from "./providers/AppProviders.tsx";

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>
);

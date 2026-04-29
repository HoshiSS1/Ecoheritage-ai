import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import App from "./app/App.tsx";
import "./styles/index.css";

// Lấy Google Client ID (Ưu tiên localStorage từ Admin portal, sau đó mới tới .env)
const GOOGLE_CLIENT_ID = localStorage.getItem("ecoheritage_google_client_id") || import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
      <Toaster position="bottom-right" richColors />
    </GoogleOAuthProvider>
  </BrowserRouter>
);
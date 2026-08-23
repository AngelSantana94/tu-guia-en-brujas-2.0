import React from "react";
import ReactDOM from "react-dom/client";
import HeaderAuth from "./components/HeaderAuth";
import UserDashboard from "./components/UserDashboard";
import MyReviews from "./components/MyReviews";
import { ProtectedRoute } from "./components/ProtectedRoute";
import EditarPerfil from "./components/EditarPerfil";
import "/src/tailwind.css";
import { Analytics } from "@vercel/analytics/react";

// 1. Header
const headerContainer = document.getElementById("header-auth-root");
if (headerContainer) {
  ReactDOM.createRoot(headerContainer).render(
    <React.StrictMode>
      <HeaderAuth />
    </React.StrictMode>,
  );
}

// 2. Dashboard de Usuario (que dentro ya incluye las reservas)
const dashboardContainer = document.getElementById("reservas-root"); // O #reservas-root
if (dashboardContainer) {
  ReactDOM.createRoot(dashboardContainer).render(
    <React.StrictMode>
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    </React.StrictMode>,
  );
}

// 3. Mis Opiniones
const opinionesContainer = document.getElementById("opiniones-root");
if (opinionesContainer) {
  ReactDOM.createRoot(opinionesContainer).render(
    <React.StrictMode>
      <ProtectedRoute>
        <MyReviews />
      </ProtectedRoute>
    </React.StrictMode>,
  );
}

const perfilRoot = document.getElementById("editar-perfil-root");
if (perfilRoot) {
  ReactDOM.createRoot(perfilRoot).render(<EditarPerfil />);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>,
);
